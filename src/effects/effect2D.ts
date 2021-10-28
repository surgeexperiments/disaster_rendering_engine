import { v4 as uuidv4 } from 'uuid';
import { DrawStaticPrimitiveType } from '../constants/constants';
import { TextureRenderingTarget } from '../materials/ITextureRenderingTarget';

import { GLArrayBuffer } from "../mesh/GLBuffer";
import { GLMesh } from "../mesh/GLMesh";
import { IMeshObject, MeshBuffersAndGLBuffers } from "../mesh/IMeshObject";
import { MeshObjectArrayBuffer } from "../mesh/WorldMesh";
import { Effect2DSurface } from "./effect2DSurface";


/**
 * @author SurgeExperiments
 * 
 * Draw stuff to a rendering target in 2D using a shader. 
 * Can have multiple input textures (static textures or RenderTexture) 
 * Can be used to do post-effects on anything that has been rendered to a texture (like a scene or a sprite) 
 * 
 * NOTE: this thing doesn't need a reference to the input texture? it only need to set the uniform for the input texture in the shader? 
 * 
 * TODO: This is a test class for the time being 
 */
export abstract class Effect2D implements IMeshObject {
    public uuid:string; 
    public name:string; 

    public hasWorldMatrix=false; 
    /* TODO: this is an ugly solution */
    public worldMatrix=null; 

    /* IMeshObject */ 
    vao:WebGLVertexArrayObject; 
    
    /* Set this in the classes that inherit */
    public material:Effect2DSurface; 
    
    public glMesh:GLMesh; 
    
    // TODO: update to allow for index buffers 
    private _buffers:Record<string,MeshObjectArrayBuffer>; 
    
    /** 
     * If you want to use the built-in shaders: set useCustomShader to false and set the requirements you want. 
     */
    constructor(name:string, drawMode:DrawStaticPrimitiveType, uuid?:string) {
        this.name = name; 

        if(!uuid) {
            this.uuid = uuidv4(); 
        } else {
            this.uuid = uuid;
        }

        this.glMesh = new GLMesh(drawMode); 
        this.material = new Effect2DSurface("blank"); 
        this._buffers = {}; 
    }

    public setArrayBuffers(name:string, buffer:MeshObjectArrayBuffer, glArrBuffer:GLArrayBuffer):void {
        this._buffers[name] = buffer; 
        this.glMesh.setArrayBuffer(name, glArrBuffer); 
    }

    public getGLArrayBuffer(name:string):GLArrayBuffer | null {
        return this.glMesh.getArrayBuffer(name); 
    }

    public getBufferArray(name:string):MeshObjectArrayBuffer | null { 
        if(name in this._buffers) {
            return this._buffers[name]; 
        }
        return null; 
    }
    
    public returnBuffersAndGLBuffers():MeshBuffersAndGLBuffers {
        const retVal:MeshBuffersAndGLBuffers = {}; 
        for(const key in this._buffers) {
            retVal[key] = {
                buffer:this._buffers[key],
                glBuffer:this.glMesh.getArrayBuffer(key) as GLArrayBuffer
            }
        }
        return retVal; 
    }
    
    abstract getTextureRenderingTargets():Set<TextureRenderingTarget>; 

    setNodeDataInMaterial():void {
        // TODO: implement 
    }

    /* Convenience */
    public addRequirement(req:string):void {
        this.material.addRequirement(req); 
    }

    public delRequirement(req:string):void {
        this.material.delRequirement(req); 
    }

    public jsonify():string {
        return ""; 
    }
    
    public createFromJSON():void { //Effect2D {

    }
}
