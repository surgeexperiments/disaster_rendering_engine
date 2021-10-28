import { WebGLLayer } from "../../src/webglLayer/webglLayer"; 
import { ShaderLoader } from "../../src/shaders/shaderLoader";
import { Renderer } from "../../src/renderer/renderer";
import { Scene } from "../../src/scene/scene";
import { Camera3D } from "../../src/camera/camera";

import { DrawBufferOptimizationType, DrawStaticPrimitiveType, TexturePixelFormat } from "../../src/constants/constants";

import { createSphereVertices, createCubeVertices } from "./assets";
import { SceneLoader } from "../../src/resourcemanager/sceneLoader";
import { ItemCreator } from "./itemCreator";
import { DirectionalLight } from "../../src/light/directionalLight";
import { PointLight } from "../../src/light/pointLight";
import { SpotLight } from "../../src/light/spotLight";
import { PhongMaterialBasic } from "../../src/materials/phongMaterialBasic";
import { IMeshObject } from "../../src/mesh/IMeshObject";


/**
 * A class used to manually test small parts of the engine 
 * 
 * REMEMBER: setInitialShaderValues! 
 */
export class SkinningTest {
    private _layer:WebGLLayer; 
    private _shaderLoader:ShaderLoader; 
    private _sceneLoader:SceneLoader; 
    private _renderer:Renderer; 
    private _scene:Scene; 
    private _itemCreator:ItemCreator; 

    private _startTime:number; 
    private _prevTime:number; 
    private _currTime:number; 
    
    /* Store data for turning light stuff on and off. Simple hack. */
    private _phongData:Record<string,unknown>; 

    private _texturedPhongMesh:IMeshObject; 
    private _spotLight:SpotLight; 

    constructor(canvasID:string) {
        this._layer = new WebGLLayer(canvasID); 
        // TODO: handle error here or make .init() 
        this._layer.init(); 
        this._shaderLoader = new ShaderLoader(this._layer); 
        this._renderer = new Renderer(this._layer, this._shaderLoader); 
        this._sceneLoader = new SceneLoader(this._layer, this._shaderLoader); 
        this._itemCreator = new ItemCreator(); 

        this._startTime = new Date().getTime(); 
        this._prevTime = this._startTime; 
        
        this._phongData = {}; 
        this._init(); 
    }
    
    
    
    private _init():void {
        /* First iteration: Only use the position-buffer, set the color via a uniform */
        const cubeVertices = createCubeVertices(100); 
        const sphereVertices = createSphereVertices(20, 48, 24);

        const cubeMesh = this._itemCreator.createColoredWorldMeshWithNormals(cubeVertices, "cubeMesh", new Float32Array([228, 0, 0, 1]), DrawStaticPrimitiveType.TRIANGLES, DrawBufferOptimizationType.STATIC_DRAW); 
        
        cubeMesh.setTranslation(0, 100, -300); 
        cubeMesh.setRotation(5, 60, 1); 
        cubeMesh.setScaling(1, 1, 1); 
        cubeMesh.renderBoundingBox = true; 
         
        const camera = new Camera3D("testCamera"); 
        camera.updateFrustrumBuffer = true;  

        const scene = new Scene("testScene"); 
        scene.addCamera(camera, true);

        scene.addWorldMesh(cubeMesh, true);

        /* Must be called before WorldMesh.computeBoundingBox() is called */
    

        const texturedPhongMesh = this._itemCreator.createTextureMeshWithNormals("seven.jpg", false, TexturePixelFormat.RGBA); 
        //const texturedPhongMesh = this._itemCreator.createDepthTextureDisplayMesh(); 
        texturedPhongMesh.setTranslation(-600, 0, -700); 
        // TODO: what happens if you scale a flat surface?! 
        texturedPhongMesh.setScaling(800, 800, 0); 
        scene.addWorldMesh(texturedPhongMesh); 
        
        // REMOVE: quick depth texture test 
        this._texturedPhongMesh = texturedPhongMesh; 

        // One box to debug frustrum culling 
        const sphereMesh = this._itemCreator.createColoredWorldMeshWithNormals(sphereVertices, "sphereMesh", new Float32Array([228, 0, 0, 1]), DrawStaticPrimitiveType.TRIANGLES, DrawBufferOptimizationType.STATIC_DRAW); 
        sphereMesh.setTranslation(2400, 0, -2000); 
        sphereMesh.renderBoundingBox = true; 
        //scene.addWorldMesh(sphereMesh, true); 
        //scene.doPostProcessing = true; 
        
        const phongSphere = this._itemCreator.createBasicPhongMeshColor(sphereVertices, "phongMesh", new Float32Array([228, 0, 0, 1]), DrawStaticPrimitiveType.TRIANGLES, DrawBufferOptimizationType.STATIC_DRAW); 
        phongSphere.setTranslation(-300, 0, -300); 
        phongSphere.setScaling(10, 10, 10); 
        // TODO: simplify light registration by adding it to the meshes 
        const directionalLight:DirectionalLight = new DirectionalLight("testDirectionalLight"); 
        directionalLight.direction = new Float32Array([0,0,-1]); 

        scene.addLight(directionalLight, true); 

        const pointLight:PointLight = new PointLight("testPointLight"); 
        pointLight.worldPosition = new Float32Array([-100, 400, -400]); 
        pointLight.color = new Float32Array([0, 255, 0]); 
        pointLight.specularColor = new Float32Array([0, 0, 255]);
        pointLight.shininess = 0.4; 

        scene.addLight(pointLight, true); 

        const spotLight:SpotLight = new SpotLight("testSpotLight"); 
        spotLight.worldPosition = new Float32Array([-300, 0, 100]); 
        // Set the camera matrix for the spotLight (for shadow mapping) 
        spotLight.createPerspectiveMatrixDegrees(60, this._layer.getCanvasAspect(), 100, 15000); 
        spotLight.setTranslation(-300, 0, 500); 
        spotLight.setLookAt(-300,0,-0);

        spotLight.direction = new Float32Array([0, 0, -1]); 
        spotLight.color = new Float32Array([0, 255, 0]); 
        spotLight.specularColor = new Float32Array([0, 0, 255]);
        spotLight.shininess = 0.8; 
        spotLight.innerMinDotLimit = 0.9; 
        spotLight.outerMinDotLimit = 0.8; 
        
        // testing 
        this._spotLight = spotLight; 

        scene.addLight(spotLight, true); 
        
        const phongTextureMaterial:PhongMaterialBasic = texturedPhongMesh.material as PhongMaterialBasic; 
        const phongSphereMaterial:PhongMaterialBasic = phongSphere.material as PhongMaterialBasic; 
        
        // TODO: this is clumsy. Quick hack. 
        this._phongData = {
            phongTextureMaterial:phongTextureMaterial,
            phongColorMaterial:phongSphereMaterial,
            directionalLight:directionalLight as DirectionalLight,
            pointLight:pointLight as PointLight,
            spotLight:spotLight as SpotLight,
            directionalActive:false,
            pointActive:false,
            spotActive:false
        }; 
        
        //phongSphere.render = false; 
        scene.addWorldMesh(phongSphere); 
        
        /* Add Glitch Effect */
        //scene.addNamedEffect("redraw", new Effect2DDrawTextureToCanvas("Renderer:EffectRenderFinalProcessedSceneToCanvas")); 
        //scene.addNamedEffect("glitchEffect", new Effect2DGlitch("glitchEffect")); 
        //scene.addPostProcessingEffect("glitchEffect");  
        
        /* Update the world matrix and compute the bounding boxes */
        scene.updateWorldMatrix();
        
        // todo: "useUnknownInCatchVariables": false in compiler
        try {
            this._sceneLoader.initScene(scene, this.run.bind(this)); 
        } catch(error) {
            alert("Could not load data, err msg: " + error.message); 
        }
    }  
    
    private _addEventHandlers():void {
        document.addEventListener('keypress', this.keypressHandler.bind(this)); 
    }

    private _setDirectionalLight(activate:boolean):void {
        const materialColor:PhongMaterialBasic = this._phongData.phongColorMaterial as PhongMaterialBasic; 
        const materialTexture:PhongMaterialBasic = this._phongData.phongTextureMaterial as PhongMaterialBasic;

        if(activate) {
            materialColor.registerDirectionalLight(this._phongData.directionalLight as DirectionalLight); 
            materialTexture.registerDirectionalLight(this._phongData.directionalLight as DirectionalLight); 
        } else {
            materialColor.removeDirectionalLight(this._phongData.directionalLight as DirectionalLight); 
            materialTexture.removeDirectionalLight(this._phongData.directionalLight as DirectionalLight); 
        }
    }


    private _setPointLight(activate:boolean):void {
        const materialColor:PhongMaterialBasic = this._phongData.phongColorMaterial as PhongMaterialBasic; 
        const materialTexture:PhongMaterialBasic = this._phongData.phongTextureMaterial as PhongMaterialBasic;

        if(activate) {
            materialColor.registerPointLight(this._phongData.pointLight as PointLight); 
            materialTexture.registerPointLight(this._phongData.pointLight as PointLight); 
        } else {
            materialColor.unregisterPointLight(this._phongData.pointLight as PointLight); 
            materialTexture.unregisterPointLight(this._phongData.pointLight as PointLight); 
        }
    }
    
    private _setSpotLight(activate:boolean):void {
        const materialColor:PhongMaterialBasic = this._phongData.phongColorMaterial as PhongMaterialBasic; 
        const materialTexture:PhongMaterialBasic = this._phongData.phongTextureMaterial as PhongMaterialBasic;

        if(activate) {
            materialColor.registerSpotLight(this._phongData.spotLight as SpotLight); 
            materialTexture.registerSpotLight(this._phongData.spotLight as SpotLight); 
        } else {
            materialColor.unregisterSpotLight(this._phongData.spotLight as SpotLight); 
            materialTexture.unregisterSpotLight(this._phongData.spotLight as SpotLight); 
        }
    }

    /**
     * w/s: move in z axis 
     * @param e 
     */
    public keypressHandler(e:KeyboardEvent):void {
        // TODO: yea know its depricated 
        switch(e.key) {
            case 'q':
                this._phongData.directionalActive = !this._phongData.directionalActive; 
                this._setDirectionalLight(this._phongData.directionalActive as boolean); 
                break; 
            case 'w':
                this._phongData.pointActive = !this._phongData.pointActive; 
                this._setPointLight(this._phongData.pointActive as boolean); 
                break; 
            case 'e':
                this._phongData.spotActive = !this._phongData.spotActive; 
                this._setSpotLight(this._phongData.spotActive as boolean);
                break; 
            case 'r':
                this._scene.getActiveCamera().addTranslation(-5, 0, 0);
                break; 
        }
    }
    
    public run(scene:Scene):void {
        this._scene = scene; 
        /* Required to get the right matrices to compute bounding boxes */
        const camera = this._scene.getActiveCamera(); 
        camera.createPerspectiveMatrixDegrees(60, this._layer.getCanvasAspect(), 100, 15000); 
        camera.setTranslation(60, 400, -1000); 
        camera.setLookAt(0,0,0);

        // REMOVE: render spot-light depth texture to mesh (didnt work ahah) 
        //const material:PhongMaterialBasic = this._texturedPhongMesh.material as PhongMaterialBasic; 
        //material.texture = this._spotLight.material.getRenderTexture("texture") as IBaseTexture2; 
        
        //camera.setLookAt(0,200,-1000);
        this._addEventHandlers(); 
        this._render(); 
    }

    private _render(time?:number):void {
        
        this._spotLight 
        const currTime = new Date(); 
        const deltaTime = currTime.getTime() - this._prevTime; 
        this._prevTime = currTime.getTime(); 
        //console.log("FPS: " + (1000/deltaTime)); 
        let elapsedTime = currTime.getTime() - this._startTime; 
        elapsedTime /= 2000; 
          
        this._scene.getActiveCamera().setTranslation(1500*Math.sin(elapsedTime), 500, 1500*Math.cos(elapsedTime)); 
        //this._scene.cameras[0].setTranslation(-4000, 200, -1000); 
        this._scene.updateWorldMatrix();
        
        this._renderer.setScene(this._scene); 
        //this._renderer.renderScene(this._scene); 

        if(time) {
            this._renderer.render(time); 
        } else {
            this._renderer.render(0); 
        }
        
        requestAnimationFrame(this._render.bind(this)); 
    }
}


const instance = new SkinningTest("myCanvas");




