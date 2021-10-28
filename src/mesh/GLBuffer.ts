import {DrawBufferArrayType, DrawBufferOptimizationType} from "../constants/constants" 


/**
 * @author SurgeExperiments
 */
abstract class GLBuffer {
    protected _bufferSet=false; 

    private _buffer: WebGLBuffer; 
    protected _length: number; 
    
    /* Used by gl.bufferData() for initialization */
    public arrayType: DrawBufferArrayType; 
    public glArrayType:number; 
    public drawType: DrawBufferOptimizationType; 
    public glDrawType:number; 
    public glType: number; 
    
    
    /**
     * @brief Buffer class that uses array type to infer various parameters for webGL. DO NOT use as a base class, 
     *        several methods must be overridden.
     *
     * @param {*} arrayType     gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER
     * @param {*} drawType      For gl.bufferData. A GLenum specifying the intended usage pattern of the 
     *                          data store for optimization purposes. gl.STATIC_DRAW ect 
     */
    constructor(arrayType:DrawBufferArrayType, drawType:DrawBufferOptimizationType, length:number)  {
        this.arrayType = arrayType; 
        this.drawType = drawType; 
        this._length = length; 
    }
    
    public get buffer():WebGLBuffer {
        return this._buffer; 
    }

    public set buffer(buf:WebGLBuffer) {
        this._bufferSet = true; 
        this._buffer = buf; 
    }

    public get bufferSet():boolean {
        return this._bufferSet; 
    }

    public get length():number {
        return this._length; 
    }

    /**
     * Num elements differ between ArrayBuffer and ElementBuffer.
     */
    public abstract get numElements():number; 

    /* NOTE: when restoring, use the exact same buffer as length is not changeable lol */
    protected jsonify():string {
        const proto:Record<string,unknown>= {}; 
        proto.length = this._length; 
        proto.arrayType = this.arrayType; 
        proto.drawType = this.drawType; 
        
        return JSON.stringify(proto); 
    }
}


export class GLArrayBuffer extends GLBuffer {
    /* safer than testing if _shaderAttribRef is set (could b 0). Also easier to port. */
    private _shaderAttribRefSet = false; 
    private _shaderAttribRef: number; 
    public numComponents: number; 
    
    public normalize: boolean; 
    public stride: number; 
    public offset: number; 
    
    private _numElements:number; 
    
    
    constructor(drawType:DrawBufferOptimizationType, length:number) {
        super(DrawBufferArrayType.ARRAY_BUFFER, drawType, length);
    }
    
    /**
     * @brief TODO: shaderAttribRef is here because it's convenient
     * @param {*} shaderAttribRef 
     * @param {*} numComponents for vertexAttribPointer:  how many components for the attrib in the shader? (vec2==2 ect)
     * @param {*} normalize     for vertexAttribPointer: A GLboolean specifying whether integer data values should be normalized into a certain range when being cast to a float.
     * @param {*} stride        for vertexAttribPointer: A GLsizei specifying the offset in bytes between the beginning of consecutive vertex attributes. 
     *                          Cannot be larger than 255. If stride is 0, the attribute is assumed to be tightly packed, that is
     * @param {*} offset        for vertexAttribPointer: A GLintptr specifying an offset in bytes of the first component in the vertex attribute array. 
     *                          Must be a multiple of the byte length of type.
     */
    setAttribPtrData(numComponents:number, normalize:boolean, stride:number, offset:number):void {
        this.numComponents = numComponents; 
        this.normalize = normalize; 
        this.stride = stride; 
        this.offset = offset; 
        
        if(numComponents <= 0) {
            throw new Error("setAttribPtrData(): numComponents is not a positive number")
        }
        this._numElements = this._length/this.numComponents; 
    }
    
    /* NOTE: Must be re-installed with webGL, whereas other attribData will b loaded via serialization */
    set shaderAttribRef(val:number) {
        this._shaderAttribRefSet = true; 
        this._shaderAttribRef = val; 
    }

    get shaderAttribRef():number {
        return this._shaderAttribRef; 
    }
    
    get shaderAttribRefSet():boolean {
        return this._shaderAttribRefSet; 
    }

    /* Buffer and shaderAttribRef must be set by WebGLLayer when we load */
    get isGLInitialized():boolean {
        return (this._bufferSet && this.shaderAttribRefSet); 
    }

    get numElements():number {
        return this._numElements; 
    }
    

    public jsonify():string {
        const proto:Record<string,unknown>= {}; 
        proto.super = super.jsonify(); 

        proto.numComponents = this.numComponents; 
        proto.normalize = this.normalize; 
        proto.stride = this.stride; 
        proto.offset = this.offset; 

        return JSON.stringify(proto);
    }
    
    /**
     * This will create an instance where the buffer is NOT set and instance.bufferSet == false. 
     * @param json 
     * @returns 
     */
    public static createFromJSON(json:string):GLArrayBuffer {
        const settings = JSON.parse(json); 
        const superSettings = JSON.parse(settings.super); 
        
        const instance = new GLArrayBuffer(superSettings.drawType, superSettings.length);
        instance.setAttribPtrData(settings.numComponents, settings.normalize, settings.stride, settings.offset); 
        
        return instance; 
    }
}


export class GLElementBuffer extends GLBuffer {

    /* A GLintptr specifying a byte offset in the element array buffer. Must be a valid multiple of the size of the given type. */
    private _offset = 0;

    constructor(drawType:DrawBufferOptimizationType, length:number) {
        super(DrawBufferArrayType.ELEMENT_ARRAY_BUFFER, drawType, length);   
    }
    
    get numElements():number {
        return this._length; 
    }

    set offset(val:number) {
        // TODO: Add a test that it is a valid multiple of the size of the given type 
        this._offset = val; 
    }

    get offset():number {
        return this._offset; 
    }

    get isGLInitialized():boolean {
        return this._bufferSet; 
    }

    public jsonify():string {
        const proto:Record<string,unknown>= {}; 
        proto.super = super.jsonify(); 

        proto.offset = this._offset;  

        return JSON.stringify(proto); 
    }
    
    public static createFromJSON(json:string):GLElementBuffer {
        const settings = JSON.parse(json); 
        const superSettings = JSON.parse(settings.super); 
        
        const instance = new GLElementBuffer(superSettings.drawType, superSettings.length);
        instance.offset = settings.offset; 

        return instance; 
    }
}

