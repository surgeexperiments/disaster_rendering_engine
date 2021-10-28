import { DrawStaticPrimitiveType } from "../constants/constants"
import { GLArrayBuffer, GLElementBuffer } from "./GLBuffer"

/**
 * @author Surge
 * @brief Every buffer in a WorldMesh has its mirror here with the GL-buffer settings and WebGLBuffer stored. 
 *        Supports using VAO's to simplify binding buffers before rendering. 
 * 
 * Buffer names: 
 * - NOTE: For gl.drawArrays() you need to set a buffer called position. 
 * - TODO: remove this limitation? 
 * 
 * NOTE: Many fields are set to private because some additional checks ect will b added later.
 * 
 * TODO: Remove throwing the Errors in functions like getGLDrawType()? 
 */
export class GLMesh {
    private _vao:WebGLVertexArrayObject; 

    /* Automatically set to true if _indicies is set. Erased if _indicies is set back to null. */
    private _isIndexDraw = false; 
    
    private _drawMode:DrawStaticPrimitiveType; 
    private _glDrawMode:number; 
    
    /* Used for glDrawArrays() param "first". Differs from GlArrayBuffer.offset  */
    private _drawArrStartIndex=0; 
    
    /* All ArrayBuffers  */
    private _arrayBuffers:Record<string,GLArrayBuffer>;  
    
    /* This is the indicies buffer and it will be GL-mirrored as an ElementArray. 
     * If this exists the mesh will be drawn using drawElements(). Else it will be drawn ucreateVertexArray(sing drawArrays(). 
     */
    private _indices:GLElementBuffer;
    
    constructor(drawMode:DrawStaticPrimitiveType) {
        this._drawMode = drawMode; 
        this._arrayBuffers = {}; 
    }
    
    set vao(val:WebGLVertexArrayObject) {
        this._vao = val; 
    }

    get vao():WebGLVertexArrayObject {
        return this._vao;
    }  

    get drawMode():DrawStaticPrimitiveType {
        return this._drawMode; 
    }

    set drawMode(drawMode:DrawStaticPrimitiveType) {
        this._drawMode = drawMode; 
    }

    set glDrawMode(val:number) {
        this._glDrawMode = val; 
    }
    
    get glDrawMode():number {
        return this._glDrawMode; 
    }

    set drawArrStartIndex(val:number) {
        this._drawArrStartIndex = val; 
    }

    get drawArrStartIndex():number {
        return this._drawArrStartIndex; 
    }

    setArrayBuffer(name: string, glArrayBuffer:GLArrayBuffer):void {
        this._arrayBuffers[name] = glArrayBuffer; 
    }

    getArrayBuffer(name:string):GLArrayBuffer | null {
        if(name in this._arrayBuffers) {
            return this._arrayBuffers[name]; 
        }
        return null; 
    }

    /**
     * 
     * @param name 
     * @returns false if buffer does not exist or not set, else true 
     */
    isBufferSet(name:string):boolean {
        if(name in this._arrayBuffers) {
            return this._arrayBuffers[name].bufferSet; 
        }
        return false; 
    }

    // TODO: any point in this? Why not just make _arrayBuffers public? It's for testing. 
    getArrayBuffers():Record<string,GLArrayBuffer> {
        return this._arrayBuffers; 
    }

    set indices(glElemBuffer:GLElementBuffer) {
        this._isIndexDraw = true; 
        this._indices = glElemBuffer; 
    }
    
    get indices():GLElementBuffer {
        return this._indices; 
    }

    get isIndexDraw():boolean {
        return this._isIndexDraw; 
    }

    /**
     * TODO: update! 
     * @returns 
     */
    getNumDrawElements():number {
        if(this._isIndexDraw) {
            /* fu**** linter */
            return this._indices?.numElements as number; 
        } else if (this._arrayBuffers["position"]){
            return this._arrayBuffers["position"].numElements; 
        } else  {
            throw("getNumDrawElements(): no valid buffers found!")
        }
    }
    
    /* Only used for drawElements() */
    getGLDrawType():number {
        if(this._isIndexDraw) {
            /* fu**** linter */
            return this._indices?.glDrawType as number; 
        } else if (this._arrayBuffers["position"]){
            return this._arrayBuffers["position"].glDrawType; 
        } else {
            throw("getGLDrawType(): no valid buffers found!")
        }     
    }  

    getIndexArrayType():number {
        return this._indices.glType; 
    }

    // TODO: Fix the name and the code!
    getBufOffset():number {
        if(this._isIndexDraw) {
            /* fu**** linter */
            return this._indices?.offset as number; 
        } else if (this._arrayBuffers["position"]){
            return this._arrayBuffers["position"].offset; 
        } else {
            throw("getElemBufOffset(): no valid buffers found!")
        } 
    }

    setShaderAttribInBuffer(name:string, shaderAttrib:number):void {
        if(name in this._arrayBuffers) {
            this._arrayBuffers[name].shaderAttribRef = shaderAttrib; 
        } else {
            throw new Error("setShaderAttribInBuffer(): unknown buffer name: " + name); 
        }
    }

    jsonify():string {
        const proto:Record<string,unknown> = {}; 
        proto.drawMode = this._drawMode;
        proto.drawArrStartIndex = this._drawArrStartIndex;
        const arrayBuffers:Record<string,string> = {}; 

        for(const key in this._arrayBuffers) {
            arrayBuffers[key] = this._arrayBuffers[key].jsonify(); 
        }
        // TODO: not pretty! 
        proto.arrayBuffers = arrayBuffers; 

        if(this._indices) {
            proto.indices = this._indices.jsonify(); 
        }  

        return JSON.stringify(proto); 
    }

    public static createFromJSON(json:string):GLMesh {
        // serialize: _drawMode, _drawArrStartIndex, _position, _normal, _tangent_, _texCoord, _indices
        const settings = JSON.parse(json); 

        const glMesh = new GLMesh(settings.drawMode); 

        for(const key in settings.arrayBuffers) {
            glMesh.setArrayBuffer(key, GLArrayBuffer.createFromJSON(settings.arrayBuffers[key])); 
        }

        if(settings.indices) {
            const glBufInd = GLElementBuffer.createFromJSON(settings.indices); 
            glMesh.indices = glBufInd; 
        }

        return glMesh; 
    }
}
