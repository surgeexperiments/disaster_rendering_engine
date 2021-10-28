import { WebGLLayer } from "../../src/webglLayer/webglLayer"; 
import { ShaderLoader } from "../../src/shaders/shaderLoader";
import { GLShader } from "../../src/materials/GLShader";


export class ShaderLoadDemo {
    private _layer:WebGLLayer; 
    private _shaderLoader:ShaderLoader; 

    constructor(canvasID:string) {
        this._layer = new WebGLLayer(canvasID); 
        // TODO: handle error here or make .init() 
        this._layer.init(); 
        this._shaderLoader = new ShaderLoader(this._layer); 
    }

    public run(requirements:Set<string>):void {
        const shader:GLShader = this._shaderLoader.getShader(requirements); 
        console.log(shader); 
    }
}


const instance = new ShaderLoadDemo("myCanvas");
const requirements:Set<string> = new Set<string>(); 
requirements.add("color"); 
instance.run(requirements); 