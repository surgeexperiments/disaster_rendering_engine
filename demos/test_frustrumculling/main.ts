import { WebGLLayer } from "../../src/webglLayer/webglLayer"; 
import { ShaderLoader } from "../../src/shaders/shaderLoader";
import { Renderer } from "../../src/renderer/renderer";
import { Scene } from "../../src/scene/scene";
import { WorldMesh } from "../../src/mesh/WorldMesh";
import { Camera3D } from "../../src/camera/camera";

import { DrawBufferOptimizationType, DrawStaticPrimitiveType, TexturePixelFormat } from "../../src/constants/constants";

import { createSphereVertices, createCubeVertices } from "./assets";
import { SceneLoader } from "../../src/resourcemanager/sceneLoader";
import { AABB } from "../../src/mesh/boundingBoxAABB";
import { PLACEMENT } from "../../src/mesh/frustrum";
import { ItemCreator } from "./itemCreator";
import { Effect2DDrawTextureToCanvas } from "../../src/effects/effectPrintTexToScreen";
import { Effect2DGlitch } from "../../src/effects/effect2dGlitch";
import { ColorMaterial } from "../../src/materials/colorMaterial";


export class FrustrumCullingTest {
    private _layer:WebGLLayer; 
    private _shaderLoader:ShaderLoader; 
    private _sceneLoader:SceneLoader; 
    private _renderer:Renderer; 
    private _scene:Scene; 
    private _itemCreator:ItemCreator; 


    private _startTime:number; 
    private _prevTime:number; 
    private _currTime:number; 

    private _ACTIVE_CAMERA = 0; 
    private _CULLING_CAMERA = 1; 
    

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
        this._init(); 
    }
    
    
    
    private _init():void {
        /* First iteration: Only use the position-buffer, set the color via a uniform */
        const cubeVertices = createCubeVertices(100); 
        const sphereVertices = createSphereVertices(20, 48, 24);

        const cubeMesh = this._itemCreator.createColoredWorldMesh(cubeVertices, "cubeMesh", new Float32Array([228, 0, 0, 1]), DrawStaticPrimitiveType.LINES, DrawBufferOptimizationType.STATIC_DRAW); 
        
        cubeMesh.setTranslation(0, 100, -300); 
        cubeMesh.setRotation(5, 60, 1); 
        cubeMesh.setScaling(1, 1, 1); 
        cubeMesh.renderBoundingBox = true; 
         

        const camera = new Camera3D("testCamera"); 
        camera.updateFrustrumBuffer = true; 
        camera.renderCameraFrustrum = true; 

        const cameraDisplayFrustrum = new Camera3D("cameraDisplayFrustrum"); 
        cameraDisplayFrustrum.updateFrustrumBuffer = true; 
        cameraDisplayFrustrum.renderCameraFrustrum = true; 
        cameraDisplayFrustrum.createPerspectiveMatrixDegrees(60, this._layer.getCanvasAspect(), 100, 2000); 
        
        // Orthographic frustrums work
        //cameraDisplayFrustrum.createOrthographicMatrix(-200, 200, -200, 200, 100, 500); 
        cameraDisplayFrustrum.setTranslation(300, 0, 300); 

        const scene = new Scene("testScene"); 
        scene.addCamera(camera, true);
        scene.addCamera(cameraDisplayFrustrum, true);  
        scene.activeCamera = 0; 

        scene.addWorldMesh(cubeMesh, true);

        for(let z=-10; z<=10; ++z) {
            for(let x=-10; x<=10; ++x) {  
                const sphereMesh = this._itemCreator.createColoredWorldMesh(sphereVertices, "sphereMesh", new Float32Array([228, 0, 0, 1]), DrawStaticPrimitiveType.LINES, DrawBufferOptimizationType.STATIC_DRAW); 
                sphereMesh.setTranslation(x*100, 0, z*100); 
                sphereMesh.renderBoundingBox = true; 
                scene.addWorldMesh(sphereMesh, true); 
            }
        } 
        
        const transparentMesh = this._itemCreator.createTextureMesh("one.png", true, TexturePixelFormat.RGBA); 
        transparentMesh.setTranslation(-500, 0, -500); 
        transparentMesh.setScaling(1000, 1000, 0); 
        scene.addWorldMesh(transparentMesh); 
        
        const transparentMesh2 = this._itemCreator.createTextureMesh("six.jpg", false, TexturePixelFormat.RGBA); 
        transparentMesh2.setTranslation(-600, 0, -700); 
        transparentMesh2.setScaling(800, 800, 0); 
        scene.addWorldMesh(transparentMesh2); 

        // One box to debug frustrum culling 
        const sphereMesh = this._itemCreator.createColoredWorldMesh(sphereVertices, "sphereMesh", new Float32Array([228, 0, 0, 1]), DrawStaticPrimitiveType.LINES, DrawBufferOptimizationType.STATIC_DRAW); 
        sphereMesh.setTranslation(2400, 0, -2000); 
        sphereMesh.renderBoundingBox = true; 
        scene.addWorldMesh(sphereMesh, true); 
        scene.doPostProcessing = true; 

        scene.addNamedEffect("glitchEffect", new Effect2DGlitch("glitchEffect")); 
        scene.addPostProcessingEffect("glitchEffect");  
        
        /* Update the world matrix and compute the bounding boxes */
        scene.updateWorldMatrix();
        for(let i=0; i<scene.worldMeshes.length; ++i) {
            scene.worldMeshes[i].computeBoundingBox(); 
        }
        //scene.addWorldMesh(cubeMesh, true); 
        let AABBworldMesh = this._itemCreator.createColoredWorldMesh({position: new Float32Array(24), indices: AABB.indicesBuffer}, "AABBMesh", new Float32Array([0, 255, 0, 1]), DrawStaticPrimitiveType.LINES, DrawBufferOptimizationType.DYNAMIC_DRAW); 
        AABBworldMesh = this._sceneLoader.initLoadedMeshObject(AABBworldMesh, {}) as WorldMesh; 

        // TODO: remove! This is a test setup! Renderer needs to be able to load this itself! 
        this._renderer._finalPostProcessingStep = this._sceneLoader.initLoadedMeshObject(this._renderer._finalPostProcessingStep, {}) as Effect2DDrawTextureToCanvas;

        this._renderer.drawBoundingBoxes(AABBworldMesh); 
        this._renderer.drawCameraFrustrums(AABBworldMesh); 
        
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


    public keypressHandler(e:KeyboardEvent):void {
        // TODO: yea know its depricated 
        switch(e.key) {
            case 'w':
                this._scene.getActiveCamera().addTranslation(0, 0, 5);
                break; 
            case 's':
                this._scene.getActiveCamera().addTranslation(0, 0, -5);
                break; 
            case 'a':
                this._scene.getActiveCamera().addTranslation(5, 0, 0);
                break; 
            case 'd':
                this._scene.getActiveCamera().addTranslation(-5, 0, 0);
                break; 
            case 'q':
                this._scene.getActiveCamera().addTranslation(0, 5, 0);
                break; 
            case 'e':
                this._scene.getActiveCamera().addTranslation(0, -5, 0);
                break; 
        }
    }
    
    public run(scene:Scene):void {
        this._scene = scene; 
        /* Required to get the right matrices to compute bounding boxes */
        const camera = this._scene.cameras[this._ACTIVE_CAMERA]; 
        camera.createPerspectiveMatrixDegrees(60, this._layer.getCanvasAspect(), 100, 15000); 
        camera.setTranslation(60, 400, -1000); 

        
        camera.setLookAt(0,0,0);
        //camera.setLookAt(0,200,-1000);
        this._addEventHandlers(); 
        this._render(); 
    }

    private _render(time?:number):void {
        const currTime = new Date(); 
        const deltaTime = currTime.getTime() - this._prevTime; 
        this._prevTime = currTime.getTime(); 
        //console.log("FPS: " + (1000/deltaTime)); 
        let elapsedTime = currTime.getTime() - this._startTime; 
        elapsedTime /= 2000; 
          
        this._scene.cameras[this._ACTIVE_CAMERA].setTranslation(1500*Math.sin(elapsedTime), 500, 1500*Math.cos(elapsedTime)); 
        //this._scene.cameras[0].setTranslation(-4000, 200, -1000); 
        this._scene.updateWorldMatrix();

        this._setColorBasedOnFrustrumCulling(); 
        this._renderer.setScene(this._scene); 

        if(time) {
            this._renderer.render(time); 
        } else {
            this._renderer.render(0); 
        }
        
        requestAnimationFrame(this._render.bind(this)); 
    }

    private _setColorBasedOnFrustrumCulling():void {
        
        // Frustrum cull based on the static camera 
        const cullingCamera = this._scene.cameras[this._CULLING_CAMERA]; 

        /* Need to set this to have an updated frustrum so frustrum culling can be done */
        cullingCamera.setViewProjectionMatrixAndFrustrum(); 
        for(let i=0; i<this._scene.worldMeshes.length; ++i) {
            const placement:PLACEMENT = cullingCamera.boxInFrustrum(this._scene.worldMeshes[i].AABBBoundingBox); 
            const material = this._scene.worldMeshes[i].material; 
            if(!(material instanceof ColorMaterial)) {
                continue; 
            }
            if(placement == PLACEMENT.OUTSIDE) {
                this._scene.worldMeshes[i].material.setSurfaceAttribute("color", new Float32Array([10, 0, 0, 1])); 
            } else {
                this._scene.worldMeshes[i].material.setSurfaceAttribute("color", new Float32Array([252, 10, 10, 1])); 
            }  
        } 
    }
}


const instance = new FrustrumCullingTest("myCanvas");



