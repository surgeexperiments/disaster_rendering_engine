import { DrawStaticPrimitiveType } from "../constants/constants"
import { ISurface } from "../materials/ISurface";
import { MaterialFactory } from "../materials/materialFactory";
import { Node } from "../node/node"
import { AABB } from "./boundingBoxAABB";
import { GLArrayBuffer, GLElementBuffer } from "./GLBuffer";
import { GLMesh } from "./GLMesh"
import { IMeshObject, MeshBuffersAndGLBuffers } from "./IMeshObject";
import { TextureRenderingTarget } from "../materials/ITextureRenderingTarget";


/**
 * Represents one mesh linked to one material, or a set of sub-meshes/continous ranges linked to its own materials. 
 * The meshes are linked to one instance of GLMesh that holds mirrors of the vertices stored in VRAM. 
 * 
 * Animation will be supported through skinned animation. 
 * 
 * GL-mirroring: Just load the WorldMesh with the buffers you have, the material ect, and the gl-mirror figures out draw modes ect. 
 */

export type MeshObjectArrayBuffer = number[] | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array; 
export type MeshObjectIndexBuffer = number[] | Uint8Array | Uint16Array | Uint32Array; 

/**
 * How to load from a serialized state: 
 * - Load a serialized WorldMesh (containing a GLMesh, all buffers). Then call LayerBuffer.glMirrorMeshObject() 
 * TODO: 
 * - Inherits from Node 
 * Supports adding different materials to ranges of position or ranges of indicies 
 * - Skeletal animation is added to this one set of continous buffers 
 * - How to best set this up with DYNAMIC_DRAW and gl-mesh?
 * 
 * Loading/Loading from JSON:
 *      When you load from serialized: It is expected that you are loading buffer and a matching GLBuffer : just GLMirror	
 *      When creating a WorldMesh for the first time it is expected that the user gives a suitable GLBuffer to GLMesh at the same time as the buffer is set.
 * Replacing buffers: 
 *  One WorldMesh is always linked to one (static) shader, so all buffers/GLBuffers in the shader must be here. 
 *  If you replace some of them (STATIC_DRAW), that has to be updated in WebGLLayer, buffers initialized and linked to the VAO. 
 * 
 * PositionBuffer: 
 * - The position buffer is in LOCAL COORDINATES. It is positioned using Node.translation, and Node.rotation + Node.scaling can also be used. 
 * 
 * 
 * TODO: Deep-copy the references. And have one that makes it from JSON that does not deep-copy (useless) 
 * - Make a system to track which buffers are changed that needs to be updated? 
 * : an array of names that U can clear. 
 */
export class WorldMesh extends Node implements IMeshObject {

    public drawMode:DrawStaticPrimitiveType; 
    public hasWorldMatrix=true; 

    // TODO: implement 
    public castShadows:boolean; 
    
    /* These buffer names are used in every shader.
     * If you use type number[] instead of the typed arrays there is a small performance penalty when using LayerBuffer as the
     * we have to create a copy of type Float32Array for everything but _indices to send to the GPU. _indices will b converted to Uint32Array. 
     * TODO: How to you deal with STREAM_WRITE?
     */
    private _position:MeshObjectArrayBuffer; 
    private _colorBuffer:MeshObjectArrayBuffer; 
    private _normal:MeshObjectArrayBuffer; 
    private _tangent:MeshObjectArrayBuffer;  
    private _texCoord:MeshObjectArrayBuffer;  
    private _boneWeights:MeshObjectArrayBuffer;  
    private _boneIndices:MeshObjectArrayBuffer; 
    
    /* This is the indicies buffer and it will be GL-mirrored as an ElementArray. 
     * If this exists the mesh will be drawn using drawElements(). Else it will be drawn using drawArrays(). 
     */
    private _indices:MeshObjectIndexBuffer;  
    
    /* The VRAM equivivalent of the buffers stored here. They are named the same in _glMesh and in every shader */
    private _glMesh:GLMesh; 
    private _material:ISurface; 
    
    /* TODO: frustrum culling! + Physics */
    private _boundingBox:AABB; 
    public renderBoundingBox = false; 

    // TODO: add to JSONify and tests 
    //public isTransparent = false; 

    /* TODO: add raycast check */
    
    /* Edit functions:
    - Add child
    - Remove child 
    */

    // TODO: remove drawMode from the constructor. It will
    constructor(name:string, drawMode:DrawStaticPrimitiveType, uuid?:string) {
        super(name, uuid); 
        this.drawMode = drawMode; 
        this._glMesh = new GLMesh(drawMode); 
        this._boundingBox = new AABB(); 
    }
    
    
    /**
     * NOTE: this assumes that the GLMesh is correctly mirrored
     * @returns 
     */
    public returnBuffersAndGLBuffers():MeshBuffersAndGLBuffers {
        const retList:MeshBuffersAndGLBuffers = {} 
        
        if(this._position) {
            retList["position"] = {"buffer":this._position, "glBuffer":this._glMesh.getArrayBuffer("position") as GLArrayBuffer}; 
        }
        
        if(this._colorBuffer) { 
            retList["colorBuffer"] = {"buffer":this._colorBuffer, "glBuffer":this._glMesh.getArrayBuffer("colorBuffer") as GLArrayBuffer}; 
        }

        if(this._normal) {
            retList["normal"] = {"buffer":this._normal, "glBuffer":this._glMesh.getArrayBuffer("normal") as GLArrayBuffer}; 
        }

        if(this._tangent) {
            retList["tangent"] = {"buffer":this._tangent, "glBuffer":this._glMesh.getArrayBuffer("tangent") as GLArrayBuffer}; 
        }

        if(this._texCoord) {
            retList["texCoord"] = {"buffer":this._texCoord, "glBuffer":this._glMesh.getArrayBuffer("texCoord") as GLArrayBuffer}; 
        }

        if(this._boneWeights) {
            retList["boneWeights"] = {"buffer":this._boneWeights, "glBuffer":this._glMesh.getArrayBuffer("boneWeights") as GLArrayBuffer};
        }

        if(this._boneIndices) {
            retList["boneIndices"] = {"buffer":this._boneIndices, "glBuffer":this._glMesh.getArrayBuffer("boneIndices") as GLArrayBuffer};
        }
        
        if(this._indices) {
            retList["indices"] = {"buffer":this._indices, "glBuffer":this._glMesh.indices as GLElementBuffer}; 
        }
        
        return retList; 
    }
    
    /**
     * TODO: Remove? Not being used 
     * NOTE: this assumes that the GLMesh is correctly mirrored
     * @returns A list of the buffers as ArrayBuffers (here Float32Array) 
     */
    public returnUnsetBuffersAndGLBuffers():MeshBuffersAndGLBuffers {
        const retList:MeshBuffersAndGLBuffers = {} 

        if(this._position && !this._glMesh.isBufferSet("position")) {
            retList["position"] = {"buffer":this._position, "glBuffer":this._glMesh.getArrayBuffer("position") as GLArrayBuffer}; 
        }

        if(this._colorBuffer && !this._glMesh.isBufferSet("colorBuffer")) {
            retList["colorBuffer"] = {"buffer":this._colorBuffer, "glBuffer":this._glMesh.getArrayBuffer("colorBuffer") as GLArrayBuffer}; 
        }

        if(this._normal && !this._glMesh.isBufferSet("normal")) {
            retList["normal"] = {"buffer":this._normal, "glBuffer":this._glMesh.getArrayBuffer("normal") as GLArrayBuffer}; 
        }

        if(this._tangent && !this._glMesh.isBufferSet("tangent")) {
            retList["tangent"] = {"buffer":this._tangent, "glBuffer":this._glMesh.getArrayBuffer("tangent") as GLArrayBuffer}; 
        }

        if(this._texCoord && !this._glMesh.isBufferSet("texCoord")) {
            retList["texCoord"] = {"buffer":this._texCoord, "glBuffer":this._glMesh.getArrayBuffer("texCoord") as GLArrayBuffer}; 
        }

        if(this._boneWeights && !this._glMesh.isBufferSet("boneWeights")) {
            retList["boneWeights"] = {"buffer":this._boneWeights, "glBuffer":this._glMesh.getArrayBuffer("boneWeights") as GLArrayBuffer};
        }

        if(this._boneIndices && !this._glMesh.isBufferSet("boneIndices")) {
            retList["boneIndices"] = {"buffer":this._boneIndices, "glBuffer":this._glMesh.getArrayBuffer("boneIndices") as GLArrayBuffer};
        }

        if(this._indices && !this._glMesh.isBufferSet("position")) {
            retList["indices"] = {"buffer":this._indices, "glBuffer":this._glMesh.indices as GLElementBuffer}; 
        }

        return retList; 
    }

    /**
     * GLMesh must be set AND glArrBuffer must have the flag bufferSet to false/not have any buffer already set.
     * @param name 
     * @param buffer 
     * @param glArrBuffer 
     */
    public setArrayBufferWithGLUpdate(name:string, buffer:MeshObjectArrayBuffer, glArrBuffer:GLArrayBuffer):void {
        if(name == "position") {
            this._position = buffer; 
            this._glMesh.setArrayBuffer("position", glArrBuffer); 
        } else if (name == "colorBuffer") {
            this._colorBuffer = buffer; 
            this._glMesh.setArrayBuffer("colorBuffer", glArrBuffer); 
        } else if (name == "normal") {
            this._normal = buffer; 
            this._glMesh.setArrayBuffer("normal", glArrBuffer); 
        } else if (name == "tangent") {
            this._tangent = buffer; 
            this._glMesh.setArrayBuffer("tangent", glArrBuffer); 
        } else if (name == "texCoord") {
            this._texCoord = buffer; 
            this._glMesh.setArrayBuffer("texCoord", glArrBuffer);
        } else if (name == "boneWeights") {
            this._boneWeights = buffer; 
            this._glMesh.setArrayBuffer("boneWeights", glArrBuffer);
        }  else if (name == "boneIndices") {
            this._boneIndices = buffer; 
            this._glMesh.setArrayBuffer("boneIndices", glArrBuffer);
        } else {
            // TODO: throw error 
            console.log("aslkdfmasd"); 
        }
    }

    public setIndexBufferWithGLUpdate(buffer:MeshObjectIndexBuffer, glElemBuffer:GLElementBuffer):void {
        this._indices = buffer; 
        this._glMesh.indices = glElemBuffer; 
    }
    
 
    /**
     * TODO: rename this function! 
     * 
     * Gives material matrix data that is often used in shaders. 
     * Material decides if it wants to use it or not. 
     * Practically, this is O(1) re as we are talking about <5 items. 
     * 
     * NOTE: don't modify these names. They are the matrix names used in every shader.
     */
    setNodeDataInMaterial():void {
        const uniforms:Record<string,unknown> = {}; 
        uniforms.worldMatrix = this.worldMatrix; 
        uniforms.worldMatrixInverseTranspose = this.getWorldMatrixInverseTranspose(); 
        this.material.setRelevantUniformsFromList(uniforms); 
    } 


    /**
     * NOTE: IF the mesh is morphed (from animation ect) this box has to be recomputed. TODO: implement in class WorldMeshAnimated
     * 
     * NOTE: Do NOT call until updateWorldMatrix() has been set on the root node! If you do the function will just exit as it requires 
     *       rootNode.updateWorldMatrix() to have run to get the right parentWorldMatrix and this.localRotationMatrix set. 
     */
    public computeBoundingBox():boolean {
        if(this._position && this.parentWorldMatrix) {
            this._boundingBox.genAABBVectors(this._position, this.scale, this.localRotationMatrix,
                                             this.translate, this.parentWorldMatrix); 
            this._boundingBox.createPositionBufferLocal(); 
            return true; 
        }

        return false; 
    }
    

    get glMesh():GLMesh {
        return this._glMesh; 
    }

    set glMesh(glMesh:GLMesh) {
        this._glMesh = glMesh;
    }

    set material(material:ISurface) {
        this._material = material; 
    }

    // TODO: actually returning an abstract class haha Fix
    get material():ISurface {
        return this._material; 
    }
    
    set position(val:MeshObjectArrayBuffer) {
        this._position = val; 
    }

    get position():MeshObjectArrayBuffer {
        return this._position; 
    }

    set colorBuffer(val:MeshObjectArrayBuffer) {
        this._colorBuffer = val; 
    }

    get colorBuffer():MeshObjectArrayBuffer {
        return this._colorBuffer; 
    }

    // TODO: turn into a function instead? 
    get isTransparent():boolean {
        return this._material.isTransparent; 
    }

    set normal(val:MeshObjectArrayBuffer) {
        this._normal = val; 
    }

    get normal():MeshObjectArrayBuffer {
        return this._normal; 
    }
    
    set tangent(val:MeshObjectArrayBuffer) {
        this._tangent = val; 
    }

    get tangent():MeshObjectArrayBuffer {
        return this._tangent; 
    }

    set texCoord(val:MeshObjectArrayBuffer) {
        this._texCoord = val; 
    }

    get texCoord():MeshObjectArrayBuffer {
        return this._texCoord; 
    }

    set boneWeights(val:MeshObjectArrayBuffer) {
        this._boneWeights = val; 
    }

    get boneWeights():MeshObjectArrayBuffer {
        return this._boneWeights; 
    }

    set boneIndices(val:MeshObjectArrayBuffer) {
        this._boneIndices = val; 
    }

    get boneIndices():MeshObjectArrayBuffer {
        return this._boneIndices; 
    }

    set indices(val:MeshObjectIndexBuffer) {
        this._indices = val; 
    }

    get indices():MeshObjectIndexBuffer {
        return this._indices; 
    }

    get AABBpositionBuffer():ArrayBuffer {
        return this._boundingBox.positionBufferLocal; 
    }

    get AABBWorldMatrixAndLocalTranslate():Float32Array {
        return this._boundingBox.worldMatrixAndLocalTranslate; 
    }
    
    get AABBBoundingBox():AABB {
        return this._boundingBox; 
    }

    set vao(val:WebGLVertexArrayObject) {
        this._glMesh.vao = val; 
    }

    get vao():WebGLVertexArrayObject {
        return this._glMesh.vao; 
    }

    // TODO: remove? 
    get materialTextureURLs():Set<string> {
        if(this.material) {
            return this.material.getTextureURLs(); 
        }
        return new Set<string>(); 
    }

    getTextureRenderingTargets():Set<TextureRenderingTarget> {
        return this.material.getTextureRenderingTargets(); 
    }
    
    jsonify():string {
        const proto:Record<string, unknown> = {};
        
        proto.super = super.jsonify(); 
        proto.drawMode = this.drawMode; 
        proto.castShadows = this.castShadows; 

        if(this._position) {
            proto.position = this._position; 
        }

        if(this._colorBuffer) {
            proto.colorBuffer = this._colorBuffer; 
        }

        if(this._normal) {
            proto.normal = this._normal; 
        }

        if(this._tangent) {
            proto.tangent = this._tangent; 
        }

        if(this._texCoord) {
            proto.texCoord = this._texCoord; 
        }

        if(this._boneWeights) {
            proto.boneWeights = this._boneWeights; 
        }

        if(this._boneIndices) {
            proto.boneIndices = this._boneIndices; 
        }

        if(this._indices) {
            proto.indices = this._indices; 
        }
        
        if(this._glMesh) {
            proto.glMesh = this._glMesh.jsonify(); 
        }

        // TODO: add support for multiple materials 
        if(this._material) {
            proto.material = this._material.jsonify(); 
        }

        return JSON.stringify(proto); 
    }

    /**
     * This will create an instance that is NOT initialized with WebGL. All .bufferSet flags in GLArrayBuffers and Element buffers in 
     * the loaded GLMesh will be set to false. Therefore returnUnsetBuffersAndGLBuffers() will return all set buffers on the new instance.
     * @param json 
     */
    public static createFromJSON(json:string):WorldMesh {
        const settings = JSON.parse(json); 

        const instance = new WorldMesh(settings.name, settings.drawMode, settings.uuid); 

        /* Node superclass settings */
        instance.setNodeFromJSON(settings.super); 
        instance.castShadows = settings.castShadows; 

        if(settings.position) {
            instance.position = settings.position; 
        }

        if(settings.colorBuffer) {
            instance.colorBuffer = settings.colorBuffer; 
        }

        if(settings.normal) {
            instance.normal = settings.normal; 
        }

        if(settings.tangent) {
            instance.tangent = settings.tangent; 
        }

        if(settings.texCoord) {
            instance.texCoord = settings.texCoord; 
        }

        if(settings.boneWeights) {
            instance.boneWeights = settings.boneWeights; 
        }

        if(settings.boneIndices) {
            instance.boneIndices = settings.boneIndices; 
        }

        if(settings.indices) {
            instance.indices = settings.indices; 
        }
        
        /* The GLMesh will be initialized with all buffers having .bufferSet to false. 
         * This way returnUnsetBuffersAndGLBuffers() will return all the set buffers so they can be GLMirrored. 
         */
        if(settings.glMesh) {
            instance.glMesh = GLMesh.createFromJSON(settings.glMesh); 
        }
        
        // TODO: add support for multiple materials 
        if(settings.material) {
            instance.material = MaterialFactory.createFromJSON(settings.material) as ISurface; 
        }

        return instance; 
    }
}

