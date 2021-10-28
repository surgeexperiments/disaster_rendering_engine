import { ISurface } from "../materials/ISurface";
import { GLArrayBuffer, GLElementBuffer } from "./GLBuffer";
import { GLMesh } from "./GLMesh";
import { TextureRenderingTarget } from "../materials/ITextureRenderingTarget";
import { MeshObjectArrayBuffer, MeshObjectIndexBuffer } from "./WorldMesh";


export interface MeshBuffersAndGLBuffers {
    [name: string]: {
        buffer: MeshObjectArrayBuffer | MeshObjectIndexBuffer,
        glBuffer: GLArrayBuffer|GLElementBuffer,
    } 
}

/**
 * Any object that can be rendered as a Mesh.
 */
export interface IMeshObject {
    vao:WebGLVertexArrayObject; 
    glMesh:GLMesh; 
    material:ISurface; 
    hasWorldMatrix:boolean; 
    worldMatrix:Float32Array | null; 
    returnBuffersAndGLBuffers():MeshBuffersAndGLBuffers; 
    /**
     * TODO: rename this function! 
     * 
     * Gives material matrix data that is often used in shaders. 
     * Material decides if it wants to use it or not. 
     * Practically, this is O(1) re as we are talking about <5 items. 
     * 
     * NOTE: don't modify these names. They are the matrix names used in every shader.
     */
     setNodeDataInMaterial():void; 
     
    /* Returns texture rendering targets for all lights attached and any textures that needs to be rendered before the mesh is rendered */
    getTextureRenderingTargets():Set<TextureRenderingTarget>; 

    //setArrayBufferWithGLUpdate(name:string, buffer:MeshObjectArrayBuffer, glArrBuffer:GLArrayBuffer):void
    //setIndexBufferWithGLUpdate(buffer:MeshObjectIndexBuffer, glElemBuffer:GLElementBuffer):void
    // computeBoundingBox():boolean 
    
    // jsonify():string 
    // createFromJSON(json:string):IMeshObject 
}