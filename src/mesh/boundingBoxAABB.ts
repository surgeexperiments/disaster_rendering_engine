import { mat4, vec3 } from "../math/gl-matrix"; 
import { v4 as uuidv4 } from 'uuid';
import { MeshObjectArrayBuffer } from "./WorldMesh";


/**
 * https://cgvr.informatik.uni-bremen.de/teaching/cg_literatur/lighthouse3d_view_frustum_culling/index.html
 * 
 * 
 * NOTE: This class is based on giving it vertices that are in LOCAL SPACE. 
 * 
 * How to use for rendering: 
 * - Call genAABBVectors(). This will create the min and max vectors for the AABB box by using a localBuffer ordered around (0,0,0).
 *   It uses scaling and rotation of the buffer to get the correctly sized box. 
 * - Call createPositionBufferLocal() to generate a renderable buffer from the min and max vectors. 
 * - Now you can use AABB.indices to render positionBufferLocal. To get it rendered correctly you must: 
 * : only apply the local translation matrix (as rotation and scaling is factored in. Additional rotation will remove the axis-alignment). 
 * : apply the entire parent matrix. 
 */
export class AABB {
    public uuid:string; 
    
    private _minVecLocal:Float32Array; 
    private _maxVecLocal:Float32Array; 
    private _minVecWorld:Float32Array; 
    private _maxVecWorld:Float32Array; 

    private _midVecWorld:Float32Array; 

    private _NUM_VERTICES_POSITION_BUFFER = 24; 

    /* A buffer with the vertices of the box in local space, centered around (0,0,0). Useful for rendering the box.
     * The AABB box will be created from the local position buffer with the scaling and rotation matrix applied. 
     * Therefore any rendering has to only apply local translation + the parent world matrix. 
     * -> This is of course dependent on you passing a position buffer in local-space to genBoxFromStaticVerticies() lol. 
    */
    private _positionBufferLocal:Float32Array; 
    private _worldMatrixAndLocalTranslate:Float32Array; 

    /* The position buffer in world coordinates. Useful for doing the actual frustrum culling */
    //private _positionBufferWorld:Float32Array; 

    /* The indices used with drawElements() for _positionBufferWorld to draw the AABB box using GL_LINES. Only need one copy of this */
    public static readonly indicesBuffer = new Uint16Array([
        0, 1, 1, 3, 3, 2, 2, 0, 
        4, 5, 5, 7, 7, 6, 6, 4,
        0, 4, 1, 5, 3, 7, 2, 6,
      ]);

    /* The indices used with drawElements() for _positionBufferLocal to draw the AABB box using GL_LINES */
    //private _indiciesBuffer:Float32Array; 

    constructor(uuid?:string) {
        if(uuid) {
            this.uuid = uuid; 
        } else {
            this.uuid = uuidv4(); 
        }

        this._positionBufferLocal = new Float32Array(24); 

        this._minVecLocal = vec3.create(); 
        this._maxVecLocal = vec3.create();
        this._minVecWorld = vec3.create(); 
        this._maxVecWorld = vec3.create(); 
        this._worldMatrixAndLocalTranslate = mat4.create(); 
    }
    
    /**
     * This only needs to be called once, or when an object is updated (changed placing/scale/rotation, animated ect)
     * @param verticiesLocalSpace 
     * @param localScaleVector 
     * @param localRotationMatrix Rotation or Lookat matrix, anything that rotates the node in place
     * @param localTranslationVector 
     * @param parentWorldMatrix 
     */
    public genAABBVectors(verticiesLocalSpace:MeshObjectArrayBuffer, localScaleVector:Float32Array, localRotationMatrix:Float32Array,
                               localTranslationVector:Float32Array, parentWorldMatrix:Float32Array):void {
        const minVec = vec3.fromValues(Infinity, Infinity, Infinity);   
        const maxVec = vec3.fromValues(-Infinity, -Infinity, -Infinity);
        
        const morphedCoord:Float32Array = vec3.create(); 
        
        const localScaleRotationMatrix:Float32Array = mat4.create(); 
        mat4.multiply(localScaleRotationMatrix, localScaleRotationMatrix, localRotationMatrix); 
        mat4.scale(localScaleRotationMatrix, localScaleRotationMatrix, localScaleVector); 
        
        for(let i=0; i<verticiesLocalSpace.length; i+=3) {
            morphedCoord[0] = verticiesLocalSpace[i]; 
            morphedCoord[1] = verticiesLocalSpace[i+1]; 
            morphedCoord[2] = verticiesLocalSpace[i+2]; 
            
            vec3.transformMat4(morphedCoord, morphedCoord, localScaleRotationMatrix);
            
            minVec[0] = Math.min(minVec[0], morphedCoord[0]);
            minVec[1] = Math.min(minVec[1], morphedCoord[1]);
            minVec[2] = Math.min(minVec[2], morphedCoord[2]);
            
            maxVec[0] = Math.max(maxVec[0], morphedCoord[0]);
            maxVec[1] = Math.max(maxVec[1], morphedCoord[1]);
            maxVec[2] = Math.max(maxVec[2], morphedCoord[2]);
        }
        
        // TODO: just use the scaling and translation on these when you need the correct position for the box?  
        vec3.copy(this._minVecLocal, minVec); 
        vec3.copy(this._maxVecLocal, maxVec); 
        const worldMatrixAndLocalTranslate = mat4.create(); 
        mat4.translate(worldMatrixAndLocalTranslate, worldMatrixAndLocalTranslate, localTranslationVector); 
        mat4.multiply(worldMatrixAndLocalTranslate, worldMatrixAndLocalTranslate, parentWorldMatrix); 
        
        /* Store this so it can be used when rendering*/
        mat4.copy(this._worldMatrixAndLocalTranslate, worldMatrixAndLocalTranslate);

        vec3.transformMat4(this._minVecWorld, this._minVecLocal, worldMatrixAndLocalTranslate); 
        vec3.transformMat4(this._maxVecWorld, this._maxVecLocal, worldMatrixAndLocalTranslate); 
    }

    public getMidpointWorld():Float32Array {
        /* TODO: micro-optimize by making midVecWorld a member? */
        const x = (this._maxVecWorld[0] + this._minVecWorld[0]) / 2; 
        const y = (this._maxVecWorld[1] + this._minVecWorld[1]) / 2; 
        const z = (this._maxVecWorld[2] + this._minVecWorld[2]) / 2; 
        return vec3.fromValues(x, y, z); 
    }
    
    /* 
    - Create the right bounding box by creating it from scaled and rotated local-space (around 0,0,0) position buffer. 
    - Then when rendering (or frustrum culling) you apply local translate and the parent world matrix to it. 
    - This way you will get the correct AABB that includes scaling and rotation of the buffer in it's final size, and it will be rendered as axis aligned while having the correct position.  
    */
    get positionBufferLocal():Float32Array {
        return this._positionBufferLocal; 
    }

    get worldMatrixAndLocalTranslate():Float32Array {
        return this._worldMatrixAndLocalTranslate; 
    }

    /**
     * Math trick to use two (P and N) vertices instead of potentially all 8 when testing if the AABB box is within or intersects the camera frustrum 
     * @param normal 
     * @returns 
     */
    public findPVertex(normal:Float32Array):Float32Array {
        const p = vec3.fromValues(this._minVecWorld[0], this._minVecWorld[1], this._minVecWorld[2]); 
        
        if (normal[0] >= 0) {
            p[0] = this._maxVecWorld[0]; //xmax;
        }
            
        if (normal[1] >=0) {
            p[1] = this._maxVecWorld[1]; //ymax;
        }
            
        if (normal[2] >= 0) {
            p[2] = this._maxVecWorld[2]; //zmax:
        }

        return p; 
    }

    public findNVertex(normal:Float32Array):Float32Array {
        const n = vec3.fromValues(this._maxVecWorld[0], this._maxVecWorld[1], this._maxVecWorld[2]); 
        if (normal[0] >= 0) {
            n[0] = this._minVecWorld[0]; //xmax;
        }
            
        if (normal[1] >=0) {
            n[1] = this._minVecWorld[1]; //ymax;
        }
            
        if (normal[2] >= 0) {
            n[2] = this._minVecWorld[2]; //zmax:
        }
            
        return n;
    }
    

    /**
     * This order works with AABB.indicesBuffer 
     */
    createPositionBufferLocal():void {
        this._positionBufferLocal[0] = this._minVecLocal[0];
        this._positionBufferLocal[1] = this._minVecLocal[1];
        this._positionBufferLocal[2] = this._minVecLocal[2]; 

        this._positionBufferLocal[3] = this._maxVecLocal[0];
        this._positionBufferLocal[4] = this._minVecLocal[1]; 
        this._positionBufferLocal[5] = this._minVecLocal[2],

        this._positionBufferLocal[6] = this._minVecLocal[0];
        this._positionBufferLocal[7] = this._maxVecLocal[1];
        this._positionBufferLocal[8] = this._minVecLocal[2]; 

        this._positionBufferLocal[9] = this._maxVecLocal[0];
        this._positionBufferLocal[10] = this._maxVecLocal[1];
        this._positionBufferLocal[11] = this._minVecLocal[2]; 

        this._positionBufferLocal[12] = this._minVecLocal[0]; 
        this._positionBufferLocal[13] = this._minVecLocal[1];  
        this._positionBufferLocal[14] = this._maxVecLocal[2]

        this._positionBufferLocal[15] = this._maxVecLocal[0]; 
        this._positionBufferLocal[16] = this._minVecLocal[1];
        this._positionBufferLocal[17] = this._maxVecLocal[2];  

        this._positionBufferLocal[18] = this._minVecLocal[0];
        this._positionBufferLocal[19] = this._maxVecLocal[1];
        this._positionBufferLocal[20] = this._maxVecLocal[2];

        this._positionBufferLocal[21] = this._maxVecLocal[0]; 
        this._positionBufferLocal[22] = this._maxVecLocal[1]; 
        this._positionBufferLocal[23] = this._maxVecLocal[2]; 
    }
}


