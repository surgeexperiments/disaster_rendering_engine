import {vec3, mat4 } from "../math/gl-matrix"
import { v4 as uuidv4 } from 'uuid';

/**
 * Base-class that represents position, rotation and scaling for an item in a scene. 
 * Supports scene-graphs. 
 * 
 * Order of applying the transformations: 
 * - localTranslation -> (localLookAt if set, else localRotation) -> worldMatrix -> localScale. 
 * - If scale is applied before worldMatrix the result becomes wrong. 
 * - Since rotation is applied after translation you can't use rotation to "aim" the translation, for example to create circular paths for a space simulation. 
 *   : Just use basic trig functions in your translation to obtain the same result. 
 * - Note: Since you select between localLookAt and localRotation you can't apply both, for example lookAt, then rotate 5 degrees in z. To do this you 
 *         have to compute this yourself and apply it to Node as a rotation, or compute a lookAt that equals the lookAt and 5 degree in z.  
 * 
 * If you use this node as a group-container: In most cases you don't want to apply scaling as it will enlarge the entire group in the nodes subtree. 
 * 
 * If you deactivate lookAt by modifying some rotation value and then need to use the old lookAt values, just 
 * 
 * Rotation and lookAt:
 * - If you set rotation, lookAt will automatically be deactivated for localMatrix. 
 * - If you set lookAt, rotation will be deactivated for localMatrix.  
 * - Any time you update translate, the lookAt matrix will be updated IF this._useLookAt is true. 
 * 
 * TODO: 
 * - Fix the selection (and mechanisms) for selecting rotation via a quat vs rotationXYZ when both are set. 
 *   (should prob be done once the shaders are done)
 * - Flag for when to update localMatrix, when to apply scaling ect? 
 * - For now you can't re-activate the old lookat-matrix by 
 */
export class Node {

    public name:string; 
    public uuid:string; 
    
    public render = true; 

    /* True if this is a node that positionally modifies a group */
    public isGroupContainer = false; 
    
    /* Set to true if the childNodes should not be rendered nor have their matrices updated when rendering */
    public subtreeDeactivated = false; 
    public frustrumCull = true; 
    
    public childNodes:Node[]; 
    public parent:Node|null = null;  
    
    public upVec:Float32Array; 

    public localMatrix:Float32Array; 
    public worldMatrix:Float32Array;
    public parentWorldMatrix:Float32Array; 
    
    protected _lookAtMatrix:Float32Array; 
    private _lookAtVec:Float32Array; 

    /***** Local space stuff *****/

    /* Set to true if lookat is selected for. Will be set to false whenever some rotation is applied. */
    protected _useLookAt = false; 

    /* Having a copy of this is very useful */
    protected _localRotationMatrix:Float32Array; 

    // TODO: Make translateLocal and translateWorld?
    public translate:Float32Array; 
    public scale:Float32Array; 
    
    public distanceFromCamera:number; 

    /* Optionally represent rotation via a quat */
    public quaternion:Float32Array|null; 
    public rotateX:number; 
    public rotateY:number; 
    public rotateZ:number; 

    /* */
    private _modifyRotationMatrix = true; 

    public translateX:number; 
    public translateY:number; 
    public translateZ:number; 
    
    /**
     * 
     * @param name 
     * @param uuid Leave out if you want one to be generated. Used for the scene graph. 
     */
    constructor(name:string, uuid?:string) {
        this.name = name; 

        if(!uuid) {
            this.uuid = uuidv4(); 
        } else {
            this.uuid = uuid;
        }
        
        this.childNodes = [];
        this.worldMatrix = mat4.create()
        this.localMatrix = mat4.create(); 
        this._localRotationMatrix = mat4.create(); 
        this.parentWorldMatrix = mat4.create(); 

        this.upVec = vec3.fromValues(0, 1, 0); 

        this.translate = vec3.create();
        this.scale = vec3.fromValues(1, 1, 1);
        
        // TODO: implement 
        this.quaternion = null; 
        //this.lookAt = vec3.create(); 

        /* Radians */
        this.rotateX = 0; 
        this.rotateY = 0; 
        this.rotateZ = 0; 

        this._lookAtMatrix = mat4.create(); 
        this._lookAtVec = vec3.create(); 
        
        /* For quick lookup. Items will often be sorted in the renderer, and field access is cleanest */
        this.translateX = 0; 
        this.translateY = 0; 
        this.translateZ = 0; 
    }


    setTranslation(x:number, y:number, z:number):void {
        this.translate = vec3.fromValues(x, y, z); 
        this.translateX = x; 
        this.translateY = y; 
        this.translateZ = z; 

        /* Any time you update translate you got to update lookAt IF it is active */
        if(this._useLookAt) {
            this.updateLookAt(); 
        }
    }  
    
    addTranslation(x:number, y:number, z:number):void {
        vec3.add(this.translate, this.translate, vec3.fromValues(x, y, z)); 
        this.translateX += x; 
        this.translateY += y; 
        this.translateZ += z; 

        /* Any time you update translate you got to update lookAt IF it is active */
        if(this._useLookAt) {
            this.updateLookAt(); 
        }
    }  
    
    setScaling(x:number, y:number, z:number):void {
        this.scale = vec3.fromValues(x, y, z); 
    }

    addScaling(x:number, y:number, z:number):void {
        vec3.add(this.scale, this.scale, vec3.fromValues(x, y, z)); 
    }
    
    setRotation(x:number, y:number, z:number):void {
        this.rotateX = x; 
        this.rotateY = y; 
        this.rotateZ = z; 
        this._modifyRotationMatrix = true; 
        this._useLookAt = false; 
    }

    addRotationX(x:number):void {
        this.rotateX += x; 
        this._modifyRotationMatrix = true;
        this._useLookAt = false; 
    }

    addRotationY(y:number):void {
        this.rotateY += y;
        this._modifyRotationMatrix = true;
        this._useLookAt = false; 
    }

    addRotationZ(z:number):void {
        this.rotateZ += z; 
        this._modifyRotationMatrix = true;
        this._useLookAt = false; 
    }  
    

    /**
     * Create the lookAt matrix, activate lookAt (instead of rotation) and store the lookAt coordinate in this.lookAtVec
     * @param x 
     * @param y 
     * @param z 
     */
    setLookAt(x:number, y:number, z:number):void {
        vec3.set(this._lookAtVec, x, y, z); 
        mat4.lookAt(this._lookAtMatrix, this.translate, this._lookAtVec, this.upVec); 
        this._useLookAt = true; 
    }   
    
    /* Use this to update lookAt if translate or lookAtVec or upVec has been updated (and lookAt is active) */
    updateLookAt():void {
        mat4.lookAt(this._lookAtMatrix, this.translate, this._lookAtVec, this.upVec); 
    }
    
    /**
     * Reactivate the lookAt stored in this.lookAtVec.
     */
    activateExistingLookAt():void {
        this.setLookAt(this._lookAtVec[0], this._lookAtVec[1], this._lookAtVec[2]); 
    }
    
    getWorldMatrixInverseTranspose():Float32Array {
        if(this.worldMatrix) {
            const inverseTranspose = mat4.create(); 
            mat4.invert(inverseTranspose, this.worldMatrix); 
            mat4.transpose(inverseTranspose, inverseTranspose); 
            return inverseTranspose; 
        } else {
            return mat4.create(); 
        }
    }

    addChild(childNode:Node):void {
        this.childNodes.push(childNode); 
    }
    
    removeChild(childNode:Node):void { 
        const index:number = this.childNodes.indexOf(childNode);
        if (index >= 0) {
            this.childNodes.splice(index, 1);
        }
    }
    
    /**
     * Distance from (0,0,0) in localSpace translated to world space to another point. 
     * @param point 
     */
    public distanceFromOriginToPointWorld(point:Float32Array):number {
        /* Start at (0,0,0) in local space */
        const position = vec3.create(); 
        vec3.transformMat4(position, position, this.worldMatrix); 

        return vec3.distance(point, position); 
    }

    public setDistanceToCamera(cameraPosition:Float32Array):void {
        this.distanceFromCamera = this.distanceFromOriginToPointWorld(cameraPosition); 
    }
    
    /**
     * 
     * @param parent set to null to remove parent, else an instance.
     */
    setParent(parent:Node):void {
        if (this.parent) {
            this.parent.removeChild(this); 
        }
        
        if (parent) {
          parent.addChild(this);
        }

        this.parent = parent;
    }

    /**
     * LookAt in local space is functionally similar to rotation in local space. 
     * Therefore this function returns lookAt (if set to active), else local rotation matrix.
     */
    get localRotationMatrix():Float32Array {
        if(this._useLookAt) {
            return this._lookAtMatrix; 
        } else {
            return this._localRotationMatrix; 
        }
    }
    
    get lookAtVec():Float32Array {
        return this._lookAtVec; 
    }

    get useLookAt():boolean {
        return this._useLookAt; 
    }

    get lookAtMatrix():Float32Array {
        return this._lookAtMatrix; 
    }


    private _createLocalRotationMatrix():Float32Array {
        const localRotationMatrix:Float32Array = mat4.create(); 
        /* Testing before rotating makes it a bit faster for objects that only rotate sometimes. Time complexity is still O(1) */
        /*
        if(this.rotateX != 0) {
            mat4.rotateX(newLocalRotationMatrix, newLocalMatrix, this.rotateX);
        }
        
        if(this.rotateY != 0) {
            mat4.rotateY(newLocalRotationMatrix, newLocalMatrix, this.rotateY);
        }

        if(this.rotateZ != 0) {
            mat4.rotateZ(newLocalRotationMatrix, newLocalMatrix, this.rotateZ);
        }   
        */

        if(this.rotateX != 0) {
            mat4.rotateX(localRotationMatrix, localRotationMatrix, this.rotateX);
        }
        
        if(this.rotateY != 0) {
            mat4.rotateY(localRotationMatrix, localRotationMatrix, this.rotateY);
        }

        if(this.rotateZ != 0) {
            mat4.rotateZ(localRotationMatrix, localRotationMatrix, this.rotateZ);
        } 

        return localRotationMatrix; 
    }

    /**
     * Recreate the local matrix instead of modifying an existing one. This prevents accumulation of errors like floating point errors. 
     * Only need to call this IF something has changed
     * 
     * TODO: Fix this with quaternion IF set + write tests 
     * 
     * TODO: optimize. Set a flag that is checked so that the local rotation matrix, local matrix ect r only updated IF a value is changed. 
     */
    genLocalMatrix():void {
        // TODO: add flags to see if the localMatrix needs to be updated at all 
        const newLocalMatrix:Float32Array = mat4.create(); 

        /* Apply this first or the mesh will translate in the direction of the rotation. We want it to translate, then rotate around the X, Y and Z axis in it's place */
        mat4.translate(newLocalMatrix, newLocalMatrix, this.translate); 
        
        if(this._useLookAt) {
            mat4.multiply(newLocalMatrix, newLocalMatrix, this._lookAtMatrix); 
        }
        /* Use local rotation matrix */
        else  {
            if(this._modifyRotationMatrix == true) {
                const newLocalRotationMatrix:Float32Array = this._createLocalRotationMatrix(); 
                mat4.copy(this._localRotationMatrix, newLocalRotationMatrix);
                this._modifyRotationMatrix = false; 
            }
            
            mat4.multiply(newLocalMatrix, newLocalMatrix, this._localRotationMatrix); 
        }

        mat4.copy(this.localMatrix, newLocalMatrix);          
    }
    
    updateWorldMatrix(parentWorldMatrix?:Float32Array):void {

        /* Recreates the local matrix. This avoids accumulating floating point errors among other things */
        this.genLocalMatrix(); 
        
        if (parentWorldMatrix) { 
          /* Don't reverse the order!*/
          mat4.multiply(this.worldMatrix, parentWorldMatrix, this.localMatrix);
          mat4.copy(this.parentWorldMatrix, parentWorldMatrix); 
        } else {
          /* We are the root node */
          mat4.copy(this.worldMatrix, this.localMatrix); 
          
          /* In this case when we are the root node: set the parent world matrix to a matrix that doesn't actually do something. 
           * For purposes where we are using local and parent matrices separately 
           * (like computing local and world AABB boxes) we can't set parentWorldMatrix to localMatrix, as this would apply the local transformation twice.  
           */
          mat4.identity(this.parentWorldMatrix); 
        }
        
        mat4.scale(this.worldMatrix, this.worldMatrix, this.scale);
        
        for(let i=0; i<this.childNodes.length; ++i) {
            this.childNodes[i].updateWorldMatrix(this.worldMatrix); 
        }
    }

    createUUIDSceneGraph(sceneGraphReference:Record<string,string[]>):void {
        /* Protect against transversing a graph cycle (that shouldn't be there) */ 
        if(this.uuid in sceneGraphReference) {
            throw new Error("createUUIDSceneGraph(): scene graph has cycles"); 
        } else if (this.childNodes.length == 0) {
            return; 
        }
        
        sceneGraphReference[this.uuid] = [];    

        for(let i=0; i<this.childNodes.length; ++i) {
            sceneGraphReference[this.uuid].push(this.childNodes[i].uuid);  
            this.childNodes[i].createUUIDSceneGraph(sceneGraphReference);  
        }
    }
    
    /**
     * NOTE: This only serializes the fields, NOT the scene graph. The classes inheriting from Node handles
     *       serializing the tree. 
     * @returns 
     */
    public jsonify():string {
        const proto:Record<string,unknown>= {}; 
        
        proto.name = this.name;  
        proto.uuid = this.uuid; 

        proto.render = this.render;
        proto.isGroupContainer = this.isGroupContainer; 
        proto.subtreeDeactivated = this.subtreeDeactivated;  
        proto.frustrumCull = this.frustrumCull;  
        proto.useLookAt = this._useLookAt; 

        if(this.quaternion !== null) {
            proto.quaternion = this.quaternion; 
        }

        proto.lookAt = {x:this._lookAtVec[0], y:this._lookAtVec[1], z:this._lookAtVec[2]}; 
        proto.scale = {x:this.scale[0], y:this.scale[1], z:this.scale[2]}; 
        proto.rotate = {x:this.rotateX, y:this.rotateY, z:this.rotateZ}; 
        proto.translate = {x:this.translateX, y:this.translateY, z:this.translateZ}; 
        
        return JSON.stringify(proto); 
    }

    /* NOTE: This expects a valid UUID */
    public setNodeFromJSON(json:string):void {
        const proto = JSON.parse(json); 
        
        this.name = proto.name; 
        this.uuid = proto.uuid; 
        
        this.render = proto.render; 
        this.isGroupContainer = proto.isGroupContainer; 
        this.subtreeDeactivated = proto.subtreeDeactivated; 
        this.frustrumCull = proto.frustrumCull;    

        if(proto.quaternion) {
            this.quaternion = proto.quaternion; 
        }
        
        this.setTranslation(proto.translate.x, proto.translate.y, proto.translate.z);
        this.setScaling(proto.scale.x, proto.scale.y, proto.scale.z); 
        this.setRotation(proto.rotate.x, proto.rotate.y, proto.rotate.z); 
        
        if(proto.useLookAt) {
            /* Set lookAtVec, create the lookAt matrix and set this._useLookAt = true */
            this.setLookAt(proto.lookAt.x, proto.lookAt.y, proto.lookAt.z)
        } else {
            this._useLookAt = false; 
            this._lookAtVec = vec3.fromValues(proto.lookAt.x, proto.lookAt.y, proto.lookAt.z); 
        }
    }
}

