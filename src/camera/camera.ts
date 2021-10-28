import {vec3, mat4} from "../math/gl-matrix"
import { AABB } from "../mesh/boundingBoxAABB";
import { Frustrum, PLACEMENT } from "../mesh/frustrum";
import { Node } from "../node/node"


enum PerspectiveMatrixType {
    UNSET=1,
    PERSPECTIVE_RADIANS=2,
    PERSPECTIVE_DEGREES=3,
    ORTHOGRAPHIC=4
}

/**
 * @author SurgeExperiments
 * 
 * gl-matrix data types like vec3 are actually float32-arrays so we type the matrices as that. 
 * 
 * The camera is at (0,0,0), and the world is moved in front of the camera. 
 * 
 * * NOTE: 
 * - The camera and frustrum culling only work with translation and lookAt.
 * - Adding scaling and rotation to the camera will not have any practical effect, even if it inherits from Node. 
 * 
 * How the camera deals with the view frustrum: 
 * - Whenever the lookAt or perspective matrix is set the view frustrum is automatically updated. 
 * - There are multiple ways of computing the camera frustrum from camera parameters (lookAt, projection matrix ect). 
 *   In this class it's computed directly from the view projection matrix using the Frustrum class. This is a little more complicated to understand than other
 *   methods like the geometric approach, but the advantages are that it's fast and it works for both orthographic and perspective matrices. 
 * - Sometimes we need to render the view frustrum (ex: debugging). To compute the position buffer for this in local space we just multiply 
 *   a clip-space ([-1,1] cube in xyz) with the inverse of the projection matrix which reverses these coordinates back into local space. 
 * - The index buffer that associates the position buffer is found as a static var named indicesBuffer. 
 */
export class Camera3D extends Node {
    
    /* Used for frustrum culling and computing the frustrum buffer upon frustrum update (if selected for) */
    private _frustrum:Frustrum; 

    /* WebGLFundamentals: A "view matrix" is the matrix that moves everything the opposite of the camera effectively making everything relative to the 
     * camera as though the  camera was at the origin (0,0,0). It basically positions the camera in the world. 
     *
     * In most cases this will be a lookAt Matrix. 
     */
    public viewMatrix:Float32Array;

    /* Go from pixel space to clip space. The projection matrix alone (when translated, scaled and rotated to where you want)
     * can let you view a scene by doing gl_Position = projectionMatrix * vertexPosition; 
     */
    public projectionMatrix:Float32Array; 

    /* Buffer the currently stored perspective matrix params so we can rebuild it quickly on change of aspect ratio 
     * (This is often needed when the canvas is resized )
     */
    private _perspectiveMatrixType:PerspectiveMatrixType; 
    private _bufferedPerspectiveSettings:Record<string,number>; 

    /* The projection matrix "box" positioned and oriented according to the cameras view */
    public viewProjectionMatrix:Float32Array; 
    
    public frustrumPositionBufferLocal:Float32Array; 
    
    /* To create a local space position buffer for the projection matrix or not when the matrix is changed */
    private _updateFrustrumBuffer:boolean; 

    /* If you want to render the current frustrum buffer you need to set updateFrumstrumBuffer to true. */
    public renderCameraFrustrum = false; 
    
    /* The indices used with drawElements() for _positionBufferWorld to draw the AABB box using GL_LINES. Only need one copy of this */
    public static readonly indicesBuffer = new Uint16Array([
        0, 1, 1, 3, 3, 2, 2, 0, 
        4, 5, 5, 7, 7, 6, 6, 4,
        0, 4, 1, 5, 3, 7, 2, 6,
      ]);

    constructor(name:string, uuid?:string) {
        super(name, uuid); 
        this._frustrum = new Frustrum(); 

        /* We don't want this updated by default */
        this._updateFrustrumBuffer = false; 
        
        this.viewMatrix = mat4.create(); 
        this.projectionMatrix = mat4.create(); 
        this.viewProjectionMatrix = mat4.create(); 

        this._perspectiveMatrixType = -1; 

        this.frustrumPositionBufferLocal = new Float32Array(24); 
        
        /* Init lookAt to origin and set the frustrum immediately */
        this.setLookAt(0,0,0); 
    }
    
    get updateFrustrumBuffer():boolean {
        return this._updateFrustrumBuffer; 
    }

    set updateFrustrumBuffer(val:boolean) {
        this._updateFrustrumBuffer = val; 
    }
    
    /**
     * Overrides from Node. 
     * @param x 
     * @param y 
     * @param z 
     */
    public setLookAt(x:number, y:number, z:number):void {
        /* Need to update translation when setting the lookAt */
        this.setTranslation(x, y, z); 
        super.setLookAt(x, y, z); 
        
        /* When the lookAt matrix is set it equals the viewMatrix. */
        mat4.copy(this.viewMatrix, this._lookAtMatrix); 
    }
    
    /**
     * NOTE/TODO: translation for Node is in local-space, but for camera you can think of it as "world space" (unless you hook camera up to a parent-node)
     * @param x 
     * @param y 
     * @param z 
     */
     public setTranslation(x:number, y:number, z:number):void {
        super.setTranslation(x, y, z); 
        
        if(this._useLookAt) {
            mat4.copy(this.viewMatrix, this._lookAtMatrix); 
        }
    }  
    
    public addTranslation(x:number, y:number, z:number):void {
        super.addTranslation(x, y, z); 
        
        if(this._useLookAt) {
            mat4.copy(this.viewMatrix, this._lookAtMatrix); 
        }
    } 
    
    public createPerspectiveMatrixRadians(fieldOfViewRadians:number, aspect:number, zNear:number, zFar:number):void {
        this._bufferedPerspectiveSettings = {fov:fieldOfViewRadians, aspect:aspect, zNear:zNear, zFar:zFar}; 
        this._perspectiveMatrixType = PerspectiveMatrixType.PERSPECTIVE_RADIANS; 

        mat4.perspective(this.projectionMatrix, fieldOfViewRadians, aspect, zNear, zFar);
        if(this._updateFrustrumBuffer) {
            this._createFrustrumPositionBufferLocalSpace(); 
        }
    }   
    
    public createPerspectiveMatrixDegrees(fieldOfViewDegrees:number, aspect:number, zNear:number, zFar:number):void {
        this._bufferedPerspectiveSettings = {fov:fieldOfViewDegrees, aspect:aspect, zNear:zNear, zFar:zFar}; 
        this._perspectiveMatrixType = PerspectiveMatrixType.PERSPECTIVE_DEGREES; 

        mat4.perspective(this.projectionMatrix, fieldOfViewDegrees * Math.PI / 180.0, aspect, zNear, zFar); 
        if(this._updateFrustrumBuffer) {
            this._createFrustrumPositionBufferLocalSpace(); 
        }
    }
    
    /**
     * @param left 
     * @param right 
     * @param bottom 
     * @param top 
     * @param near 
     * @param far 
     */
     public createOrthographicMatrix(left:number, right:number, bottom:number, top:number, near:number, far:number):void {
        this._bufferedPerspectiveSettings = {left:left, right:right, bottom:bottom, top:top, near:near, far:far}; 
        this._perspectiveMatrixType = PerspectiveMatrixType.ORTHOGRAPHIC; 

        mat4.ortho(this.projectionMatrix, left, right, bottom, top, near, far); 
        if(this._updateFrustrumBuffer) {
            this._createFrustrumPositionBufferLocalSpace(); 
        }
    }

    /**
     * NOTE: don't call before a perspective matrix has actually been set rofl 
     */
     public rebuildPerspectiveMatrixFromAspectChange(newAspect:number):void {
        const settings = this._bufferedPerspectiveSettings; 

        /* Aspect is only relevant for the perspective matrix */
        switch(this._perspectiveMatrixType) {
            case PerspectiveMatrixType.PERSPECTIVE_RADIANS:
            case PerspectiveMatrixType.PERSPECTIVE_DEGREES:
                settings.aspect = newAspect; 
                this._recreatePerspectiveMatrixFromParams(this._perspectiveMatrixType, settings); 
                break; 
            default: 
                // TODO: throw error?
                console.log("rebuildPerspectiveMatrixFromAspectChange() called before perspective matrix is set"); 
        }
    }

    private _recreatePerspectiveMatrixFromParams(perspectiveMatrixType:PerspectiveMatrixType, settings:Record<string,number>):void {
        switch(perspectiveMatrixType) {
            case PerspectiveMatrixType.PERSPECTIVE_RADIANS: 
                this.createPerspectiveMatrixRadians(settings.fov, settings.aspect, settings.zNear, settings.zFar); 
                break; 
            case PerspectiveMatrixType.PERSPECTIVE_DEGREES:
                this.createPerspectiveMatrixDegrees(settings.fov, settings.aspect, settings.zNear, settings.zFar); 
                break; 
            case PerspectiveMatrixType.ORTHOGRAPHIC:
                this.createOrthographicMatrix(settings.left, settings.right, settings.bottom, settings.top, settings.near, settings.far);
                break; 
            default: 
                // TODO: throw error?
                console.log("rebuildPerspectiveMatrixFromAspectChange() called before perspective matrix is set"); 
        }
    }

    /**
     * When using this method, only Node.translation will have an effect. Node.rotation ect are not used as the lookat method
     * uses position and the up-vector to determine rotation. To change rotation set a different up vector. 
     * 
     * Note: You need to call this to have a frustrum set!
     * 
     * @returns 
     */
     public setViewProjectionMatrixAndFrustrum():void{
        mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
        this._frustrum.frustrumFromMVPMatrix(this.viewProjectionMatrix); 
    }
    
    public setViewProjectionMatrix():void {
        mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    }
    
    public boxInFrustrum(box:AABB):PLACEMENT {
        return this._frustrum.boxInFrustum(box); 
    }

    public pointInFrustum(p:Float32Array):PLACEMENT {
        return this._frustrum.pointInFrustum(p); 
    }

    public sphereInFrustum(p:Float32Array, radius:number):PLACEMENT {
        return this._frustrum.sphereInFrustum(p, radius); 
    }

    public returnTranslatedViewProjectionMatrix(x:number, y:number, z:number):Float32Array  {
        const matrix:Float32Array  = mat4.create(); 
        
        /* Don't set x, y and z in create(), that fails! */
        const translationVector:Float32Array  = vec3.create(); 
        vec3.set(translationVector, x, y, z); 
        mat4.translate(matrix, this.viewProjectionMatrix, translationVector); 

        return matrix; 
    }

    /**
     * @brief goes without saying: don't use until you've called genViewMatrix()
     */
     public returnViewMatrixInverse():Float32Array  {
        const viewInverse:Float32Array  = mat4.create(); 
        mat4.invert(viewInverse, this.viewMatrix); 
        return viewInverse; 
    }
    
    /* TODO: kinda dumb, users can still modify the frustrum var like this, but it cannot be set anew for the camera */
    get frustrum():Frustrum {
        return this._frustrum; 
    }

    /**
     * This only relies on the projection-matrix, so it only needs to be updated when a new projection matrix is set.
     */
    private _createFrustrumPositionBufferLocalSpace():void {
        /* Multiply a clip-space cube with the inverse of the projection matrix */

        const clipSpaceBuffer = new Float32Array([
                                                -1, -1, -1,
                                                 1, -1, -1,
                                                -1,  1, -1,
                                                 1,  1, -1,
                                                -1, -1,  1,
                                                 1, -1,  1,
                                                -1,  1,  1,
                                                 1,  1,  1
                                                ]); 
                                                
        const morphedCoord:Float32Array = vec3.create(); 

        const invertedProjectionMatrix:Float32Array = mat4.create(); 
        mat4.invert(invertedProjectionMatrix, this.projectionMatrix); 
        
        for(let i=0; i<clipSpaceBuffer.length; i+=3) {
            morphedCoord[0] = clipSpaceBuffer[i]; 
            morphedCoord[1] = clipSpaceBuffer[i+1]; 
            morphedCoord[2] = clipSpaceBuffer[i+2]; 
            
            vec3.transformMat4(morphedCoord, morphedCoord, invertedProjectionMatrix);
            
            // TODO: Can't we use references or pointer tricks in javascript to just pass the (arr + offset) .transformMat4? 
            clipSpaceBuffer[i] = morphedCoord[0]; 
            clipSpaceBuffer[i+1] = morphedCoord[1]; 
            clipSpaceBuffer[i+2] = morphedCoord[2]; 
        }

        this.frustrumPositionBufferLocal.set(clipSpaceBuffer); 
    }
    
    // TODO: remove projectionMatrix from the json stuff. Recreate createFromJSON instead? 
    public jsonify():string {
        const proto:Record<string,unknown>= {}; 
        
        proto.super = super.jsonify(); 
        proto.projectionMatrix = this.projectionMatrix; 
        proto.upVec = this.upVec; 
        
        return JSON.stringify(proto); 
    }
    
    // TODO: implement 
    public jsonifyNew():string {
        const proto:Record<string,unknown>= {}; 
        
        proto.super = super.jsonify(); 
        proto.perspectiveMatrixType = this._perspectiveMatrixType; 
        if(this._perspectiveMatrixType !== PerspectiveMatrixType.UNSET) {
            proto.bufferedPerspectiveSettings = this._bufferedPerspectiveSettings; 
            
        } 
        
        //proto.projectionMatrix = this.projectionMatrix; 
        proto.upVec = this.upVec; 
        
        return JSON.stringify(proto); 
    }


    public static createFromJSON(json:string):Camera3D {
        const settings = JSON.parse(json); 
    
        const instance = new Camera3D(settings.name, settings.uuid); 

        instance.setNodeFromJSON(settings.super); 
        instance.projectionMatrix = settings.projectionMatrix; 
        instance.upVec = settings.upVec;
        
        return instance;  
    }

    public static createFromJSONNew(json:string):Camera3D {
        const settings = JSON.parse(json); 
    
        const instance = new Camera3D(settings.name, settings.uuid); 

        instance.setNodeFromJSON(settings.super); 
        if(settings.perspectiveMatrixType !== PerspectiveMatrixType.UNSET) {
            instance._recreatePerspectiveMatrixFromParams(settings.perspectiveMatrixType, settings.bufferedPerspectiveSettings);
        }
        
        instance.upVec = settings.upVec;
        
        return instance;  
    }
}






