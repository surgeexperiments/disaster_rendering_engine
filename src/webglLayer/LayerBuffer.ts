import { WebGLRenderingContext } from "../d.ts/WebGLContext";

import { MeshObjectArrayBuffer, MeshObjectIndexBuffer } from "../mesh/WorldMesh";
import { GLMesh } from "../mesh/GLMesh";
import { GLArrayBuffer, GLElementBuffer } from "../mesh/GLBuffer";
import { ConstantsConverter } from "./constantsConverter";
import { OESVertexArrayExtension } from "./capabilities";
import { IMeshObject, MeshBuffersAndGLBuffers } from "../mesh/IMeshObject";


export class LayerBuffer {
    private _gl:WebGLRenderingContext; 
    private _constantsConverter:ConstantsConverter; 
    private _vaoExtension:OESVertexArrayExtension; 

    constructor(gl:WebGLRenderingContext, vaoExtension:OESVertexArrayExtension) {
        this._gl = gl; 
        this._constantsConverter = new ConstantsConverter(gl); 
        this._vaoExtension = vaoExtension; 
    }

    /**
     * Load a WorldMesh with its buffers and a GLMesh that contains the GL-settings for those buffers. 
     * This function will then init the buffers on VRAM and store the WebGLBuffer-references in the GLBuffers stored in glMesh.  
     * 
     * @param meshObject A MeshObject that contains a GLMesh that contains the settings for each buffer. 
     */
    public glMirrorMeshObject(meshObject:IMeshObject):void {
        meshObject.vao = this._createVAO();
        this.bindVAO(meshObject.vao);
        
        const glMesh = meshObject.glMesh; 
        glMesh.glDrawMode = this._constantsConverter.drawStaticPrimititveTypeToGL(glMesh.drawMode);

        // Set up the attribs of each buffer 
        const bufList:MeshBuffersAndGLBuffers = meshObject.returnBuffersAndGLBuffers();
        this._initGLBuffers(bufList); 
    }
    
    private _createVAO():WebGLVertexArrayObjectOES {
        return this._vaoExtension.createVertexArrayOES();
    }

    public bindVAO(vao:WebGLVertexArrayObjectOES):void {
        this._vaoExtension.bindVertexArrayOES(vao);
    }

    /**
     * Important: Call this after a vao is bound if you want to have the buffers bound to that vao. 
     * 
     * NOTE: if the bufList contains array buffers that is not linked to a shader attribute it will not be initialized. 
     *       This way, if your mesh contains buffers that are not used in its material it won't cause trouble or waste resources.
     * 
     * TODO: This function creates new Float32Arrays from number[]. Is it better to always work with Float32Arrays? 
     * @param bufList {bufferName:{buffer:arr, glBuffer:GLBuffer instance corresponding to buffer:arr}}
     *      The actual buffer can be of these types: 
     *          ArrayBuffer: a normal number array (which will be converted to Float32Array), or any of the types in 
     *                       _getGLBufferType() 
     *                       NOTE: if ArrayBuffer.shaderAttribRefSet is false the buffer will not be set. 
     *                             as there is no accompanying shader to utilize it. 
     * 
     *          ElementBuffer: A normal number array (which will be converted to uint32Array), or one of: 
     *                         Uint8Array, Uint16Array, Uint32Array. 
     */
    private _initGLBuffers(bufList:MeshBuffersAndGLBuffers):void {
        for(const key in bufList) {
            // TODO: figure out something better? Force the use of Float32Arr or similar and use _getGLBufferType() instead? 
            const buffer:MeshObjectArrayBuffer = bufList[key]["buffer"];
            const glBuffer:GLArrayBuffer|GLElementBuffer = bufList[key]["glBuffer"];
            
            if(glBuffer instanceof GLArrayBuffer) {
                if(glBuffer.shaderAttribRefSet) {
                    this._initArrBufMeta(buffer, glBuffer); 
                }
            } else if(glBuffer instanceof GLElementBuffer) {
                this._initElementBufferMeta(buffer as MeshObjectIndexBuffer, glBuffer); 
            } else {
                throw new Error("_initGLBuffers(): unknown glBuffer-type")
            }
            
            /*
            this._setBufferGLValues(buffer, glBuffer); 
            glBuffer.buffer = this._createGLBuffer(buffer, glBuffer.glArrayType, glBuffer.glDrawType); 
            
            if(glBuffer instanceof GLArrayBuffer) {
                this._initArrBuf(glBuffer); 
            } 
            */
        }
    }
    
    /**
     * Use for updating stuff like DYNAMIC_DRAW
     * 
     * TODO: update, this is messy? 
     */
    public updateBuffer(buffer:ArrayBuffer, offset:number, glBuffer:GLArrayBuffer):void {
        this._updateGLBuffer(buffer, glBuffer.glArrayType, offset, glBuffer.buffer); 
    }
    
    private _initArrBufMeta(buffer:MeshObjectArrayBuffer, glBuffer:GLArrayBuffer):void {
        try {
            /* This throws an error if buffer is not a typed array */
            const glBufType = this._getGLBufferType(buffer); 
            this._initArrBuf(buffer as ArrayBuffer, glBufType, glBuffer); 

        } catch {
            /* Assumption: buffer is of type number[] so we convert it to Float32Array and process from there. 
             * TODO: This would crash spectacularly if someone passes an array of strings ect. Just let it crash? Add paranoia checks? If someone
             *       makes an error like this the whole program should probably just collapse
             */
            const bufferFloat32 = new Float32Array(buffer); 
            this._initArrBuf(bufferFloat32, this._gl.FLOAT, glBuffer); 
        }
    }   
    
    private _initArrBuf(buffer:ArrayBuffer, glBufType:number, glBuffer:GLArrayBuffer) {
        glBuffer.glArrayType = this._constantsConverter.drawBufferArrayTypeToGL(glBuffer.arrayType); 
        glBuffer.glDrawType = this._constantsConverter.drawBufferOptimizationTypeToGL(glBuffer.drawType);
        glBuffer.glType = glBufType; 
        
        glBuffer.buffer = this._createGLBuffer(buffer, glBuffer.glArrayType, glBuffer.glDrawType); 
        
        this._initArrBufVertexAttrib(glBuffer); 
    }
    
    // TODO: Check that type number[] throws an error and that the new initialization works  
    private _initElementBufferMeta(buffer:MeshObjectIndexBuffer, glBuffer:GLElementBuffer):void {
        try {
            /* WebGL will allow three types of ArrayBuffers for index-buffers */
            const glBufType = this._getGLBufferType(buffer);
            switch(glBufType) {
                case this._gl.UNSIGNED_BYTE:
                case this._gl.UNSIGNED_SHORT:
                case this._gl.UNSIGNED_INT:
                    this._initElementBuffer(buffer as ArrayBuffer, glBufType, glBuffer); 
                    break; 
                default:
                    /* Try conversion */
                    throw new Error(); 
            }
        } catch {
            /* WebGl2 requires the OES_element_index_uint to use gl.UNSIGNED_int/Uint32Array, so we use Uint16Array */
            const bufUint16 = new Uint16Array(buffer); 
            this._initElementBuffer(bufUint16, this._gl.UNSIGNED_SHORT, glBuffer); 
        }
    }   
    
    
    private _initElementBuffer(buffer:ArrayBuffer, glBufType:number, glBuffer:GLElementBuffer):void {
        glBuffer.glArrayType = this._constantsConverter.drawBufferArrayTypeToGL(glBuffer.arrayType); 
        glBuffer.glDrawType = this._constantsConverter.drawBufferOptimizationTypeToGL(glBuffer.drawType);
        glBuffer.glType = glBufType; 
        glBuffer.buffer = this._createGLBuffer(buffer, glBuffer.glArrayType, glBuffer.glDrawType);
    }
    
    private _initArrBufVertexAttrib(glArrBuf:GLArrayBuffer):void {
        this._gl.enableVertexAttribArray(glArrBuf.shaderAttribRef);
        this._gl.bindBuffer(glArrBuf.glArrayType, glArrBuf.buffer);
        this._gl.vertexAttribPointer(
            glArrBuf.shaderAttribRef,
            glArrBuf.numComponents,
            glArrBuf.glType,
            glArrBuf.normalize,
            glArrBuf.stride,
            glArrBuf.offset);
    }
    
    /*
    private _setBufferGLValues(buffer:Float32Array, glBuffer:GLArrayBuffer|GLElementBuffer) {
        glBuffer.glArrayType = this._constantsConverter.drawBufferArrayTypeToGL(glBuffer.arrayType); 
        glBuffer.glDrawType = this._constantsConverter.drawBufferOptimizationTypeToGL(glBuffer.drawType);
        glBuffer.glType = this._getGLBufferType(buffer);  
    }
    */
    
    // TODO: remove param glType 
    private _createGLBuffer(buffer:ArrayBuffer, glArrayType:number, glDrawType:number):WebGLBuffer {
        const webGLBuffer:WebGLBuffer = this._gl.createBuffer() as WebGLBuffer;
        this._gl.bindBuffer(glArrayType, webGLBuffer);
        this._gl.bufferData(glArrayType, buffer, glDrawType); 
        
        return webGLBuffer; 
    }

    private _updateGLBuffer(buffer:ArrayBuffer, glArrayType:number, offset:number, webGLBuffer:WebGLBuffer):void {
        this._gl.bindBuffer(glArrayType, webGLBuffer);
        this._gl.bufferSubData(glArrayType, offset, buffer);
    }
   
    private _getGLBufferType(buf:MeshObjectArrayBuffer | MeshObjectIndexBuffer):number {
        if (buf instanceof Uint8Array)   { return this._gl.UNSIGNED_BYTE; }   
        if (buf instanceof Uint16Array)  { return this._gl.UNSIGNED_SHORT; }  
        if (buf instanceof Uint32Array)  { return this._gl.UNSIGNED_INT; }    
        if (buf instanceof Int8Array)    { return this._gl.BYTE; }            
        if (buf instanceof Int16Array)   { return this._gl.SHORT; }           
        if (buf instanceof Int32Array)   { return this._gl.INT; }             
        if (buf instanceof Float32Array) { return this._gl.FLOAT; }           
        throw Error("Buffer:getGLBufferType(): could not infer buffer type");    
    }

    /**
     * 
     * @param glMesh 
     * @param bindElementBuffer No need to set this to true if you are using a vao. If you are not using a VAO it should prob b true.
     */
    public draw(glMesh:GLMesh, bindElementBuffer=false):void {
        if(glMesh.isIndexDraw) {
            //this._gl.drawElements(glMesh.glDrawMode, glMesh.getNumDrawElements(), glMesh.getGLDrawType(), glMesh.getBufOffset());
            // TODO: update! 
            if(bindElementBuffer) {
                const indices = glMesh.indices; 
                this._gl.bindBuffer(indices.glArrayType, indices.buffer); 
            }
            
            this._gl.drawElements(glMesh.glDrawMode, glMesh.getNumDrawElements(), glMesh.getIndexArrayType(), glMesh.getBufOffset());
        } else {
            this._gl.drawArrays(glMesh.glDrawMode, glMesh.drawArrStartIndex, glMesh.getNumDrawElements());
        }
    }

    
    /* Be careful about creating and deleting too many buffers as it can cause video memory fragmentation.
     * What's freed with "deleteBuffer" might not actually be freed for new use until the complete GL context is deleted.
     * Consider using gl.DYNAMIC_DRAW (performance penalty since it streams from the CPU) or preallocate large 
     * buffers and use bufferSubData() + offsets instead. 
     */
    // TODO: this must be handled better by using GLMemoryPoolManager
    /*
    delete(buffers:any):void {
        for(const key in buffers) {
            buffers[key].delete();
        } 
    }
    */
   
    bindArrayBufferForDraw(glArrBuf:GLArrayBuffer):void {
        this._gl.enableVertexAttribArray(glArrBuf.shaderAttribRef);
        this._gl.bindBuffer(glArrBuf.arrayType, glArrBuf.buffer);
        this._gl.vertexAttribPointer(
            glArrBuf.shaderAttribRef,
            glArrBuf.numComponents,
            glArrBuf.glType,
            glArrBuf.normalize,
            glArrBuf.stride,
            glArrBuf.offset);
    }

    /**
     * To bind an array buffer to an arbitrary shader attrib 
     * @param glArrBuf 
     * @param shaderAttribRef 
     */
    bindArrayBufferToShaderAttrib(glArrBuf:GLArrayBuffer, shaderAttribRef:number):void {
        this._gl.bindBuffer(glArrBuf.glArrayType, glArrBuf.buffer);
        this._gl.enableVertexAttribArray(shaderAttribRef);
        this._gl.vertexAttribPointer(
            shaderAttribRef,
            glArrBuf.numComponents,
            glArrBuf.glType,
            glArrBuf.normalize,
            glArrBuf.stride,
            glArrBuf.offset);
    }
}








