/*
Gen 1x1 box with color 

Gen camera line buffer whenever a new frustrum and camera position is set
- use the frustrum functions 
:: TOOD: implement them in camera (Camera needs to auto-generate these frustrum vertices whenever a change is made. For both perspective types)

Render offset boxes and use two cameras 
- Use a normal vertex shader with GL.LINES 

Set  the color of the vertex shader based on if it is in the frustrum-camera. 
Main camera is not frustrum culled 

Then use visual inspection to see if it works. 

Test the frustrum culling in both vertical and horizontal directions 
*/


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
import { IBaseTexture2 } from "../../src/materials/IBaseTexture";
import { mat4, vec3 } from "../../src/math/gl-matrix";
import { SkinnedTextureMaterial } from "../../src/materials/SkinnedTextureMaterial";


/**
 * A class used to manually test small parts of the engine 
 * 
 * REMEMBER: setInitialShaderValues! 
 */
export class SkinnedAnimationTest {
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
    private _bones:Float32Array[]; 
    private _skinnedTextureMaterial:SkinnedTextureMaterial; 

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
        
        this._bones = []; 
        this._init(); 
    }
    
    
    
    private _init():void {
        const cubeMesh = this._itemCreator.createSkinnedAnimationTextureMesh("seven.jpg", false, TexturePixelFormat.RGBA); 
        this._skinnedTextureMaterial = cubeMesh.material as SkinnedTextureMaterial; 
        
        cubeMesh.setTranslation(-600, 0, -700); 
        cubeMesh.setScaling(800, 800, 0); 
         
        const camera = new Camera3D("testCamera"); 
        camera.updateFrustrumBuffer = true;  
        
        const scene = new Scene("testScene"); 
        scene.addCamera(camera, true);

        scene.addWorldMesh(cubeMesh, true);
        
        /* Update the world matrix and compute the bounding boxes */
        scene.updateWorldMatrix();
        
        // todo: "useUnknownInCatchVariables": false in compiler
        try {
            this._sceneLoader.initScene(scene, this.run.bind(this)); 
        } catch(error) {
            alert("Could not load data, err msg: " + error.message); 
        }
    }  

    private _createBoneMatricies():Float32Array[] {
        return [mat4.create(), mat4.create(), mat4.create(), mat4.create()]; 
    }

    private _updateBoneMatricies(boneMatricies:Float32Array[], time:number):void {
        for(let i=0; i<boneMatricies.length; ++i) {
            mat4.translate(boneMatricies[i], boneMatricies[i], vec3.fromValues(i*Math.sin(time), i*Math.sin(time), i*Math.sin(time))); 
        }
    }
    
    public run(scene:Scene):void {
        this._scene = scene; 
        /* Required to get the right matrices to compute bounding boxes */
        const camera = this._scene.getActiveCamera(); 
        camera.createPerspectiveMatrixDegrees(60, this._layer.getCanvasAspect(), 100, 15000); 
        camera.setTranslation(60, 400, -1000); 
        camera.setLookAt(0,0,0);
        
        this._bones = this._createBoneMatricies(); 
        this._skinnedTextureMaterial.setBones(this._bones);
        this._render(); 
    }
    

    private _render(time?:number):void {
        
        
        const currTime = new Date(); 
        const deltaTime = currTime.getTime() - this._prevTime; 
        this._prevTime = currTime.getTime(); 
        //console.log("FPS: " + (1000/deltaTime)); 
        let elapsedTime = currTime.getTime() - this._startTime; 
        elapsedTime /= 2000; 
        
        this._updateBoneMatricies(this._bones, elapsedTime/1000); 

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


const instance = new SkinnedAnimationTest("myCanvas");




