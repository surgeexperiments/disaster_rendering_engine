import { WebGLRenderingContext } from "../d.ts/WebGLContext";

export interface OESVertexArrayExtension { 
    createVertexArrayOES():WebGLVertexArrayObject;
    bindVertexArrayOES(vao:WebGLVertexArrayObject):void;
    deleteVertexArrayOES(vao:WebGLVertexArrayObject):void;
    isVertexArrayOES(vao:WebGLVertexArrayObject):boolean; 
}

/**
 * Checks for things like WebGL2 support, extension support ect. 
 * (Note: we need VAO support for this engine to work)
 * 
 * WebGL 1: The OES_vertex_array_object extension allows you to use vertex array objects in a WebGL 1 context.
 * 
 * 
 */
export class WebGLCapabilities {
    private _gl:WebGLRenderingContext; 
    private _vao:OESVertexArrayExtension; 
    private _depthTexture:WEBGL_depth_texture; 

    constructor(gl:WebGLRenderingContext) {
        this._gl = gl; 
    }

    get vao():OESVertexArrayExtension {
        return this._vao; 
    }

    get depthTexture():WEBGL_depth_texture {
        return this._depthTexture; 
    }
    
    /* Enable use of Vertex Array Objects IF possible on WebGL1.*/
    enableVAOExtension():boolean {
        const vao:OESVertexArrayExtension|null = this._gl.getExtension('OES_vertex_array_object'); 
        
        if(vao === null) {
            return false; 
        }

        this._vao = vao;  
        return true; 
    }

    enableFloatTextureExtension():boolean {
        // const ext = gl.getExtension('OES_texture_float');
        return true; 
    }

    enableDepthTexture():boolean {
        const depthTexture:WEBGL_depth_texture = this._gl.getExtension('WEBGL_depth_texture');

        if(depthTexture === null) {
            return false; 
        }

        this._depthTexture = depthTexture;  
        return true; 
    }
}

