import { WebGLLayer } from "../../src/webglLayer/webglLayer"; 
import { SceneLoader } from "../../src/resourcemanager/sceneLoader"; 
import { ShaderLoader } from "../../src/shaders/shaderLoader";
import { Renderer } from "../../src/renderer/renderer";
import { Scene } from "../../src/scene/scene";
import assets from "./assets";


/**
 * A class used to manually test small parts of the engine 
 * 
 * REMEMBER: setInitialShaderValues! 
 */
export class MiniDemo {
    private _layer:WebGLLayer; 
    private _shaderLoader:ShaderLoader; 
    private _sceneLoader:SceneLoader; 
    private _renderer:Renderer; 
    private _currScene:Scene; 

    constructor(canvasID:string) {
        this._layer = new WebGLLayer(canvasID); 
        // TODO: handle error here or make .init() 
        this._layer.init(); 
        this._shaderLoader = new ShaderLoader(this._layer); 
        this._renderer = new Renderer(this._layer, this._shaderLoader); 
        this._sceneLoader = new SceneLoader(this._layer, this._shaderLoader); 
    }

    public run(json:string):void {
        try {
            this._currScene = this._sceneLoader.loadSceneFromJSON(json); 
        } catch(error) {
            alert("Could not load data, err msg: " + error.message); 
        }
        // Init camera matrix
        const camera = this._currScene.getActiveCamera(); 
        //camera.setLookAt(0,0,0); 
        camera.addTranslation(20,0,400);   
        camera.createPerspectiveMatrixDegrees(60, this._layer.getCanvasAspect(), 1, 2000); 

        this._renderer.renderScene(this._currScene); 
    }
}


const instance = new MiniDemo("myCanvas");
instance.run(assets); 