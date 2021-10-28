
import {Camera3D} from "../camera/camera"
import {Node} from "../node/node"
import {WorldMesh} from "../mesh/WorldMesh"
import { Effect2D } from "../effects/effect2D";
import { BaseLight } from "../light/baseLight";


export class Scene extends Node {

    public activeCamera:number; 
    public cameras:Camera3D[];
     
    // private fog:number; 

    public worldMeshes: WorldMesh[]; 
    public effects2D:Record<string,Effect2D>;  

    private _postProcessingEffects:Effect2D[]; 

    public doPostProcessing=false; 

    public lights:Record<string,BaseLight>;  

    constructor(name:string, uuid?:string) {
        super(name, uuid); 
        // TODO: fix 
        this.activeCamera = 0; 
        this.cameras = []; 
        this.worldMeshes = []; 
        this.effects2D = {}; 
        this.lights = {}; 
        this._postProcessingEffects = []; 
    }
    
    get postProcessingEffects():Effect2D[] {
        return this._postProcessingEffects; 
    }

    /**
     * 
     * @param camera 
     * @param sceneAsParentNode if true, the cameras parent node will be set to the scene. 
     *                          Set to false if you have set another parent-node for the camera prior to calling this function.
     */
    addCamera(camera:Camera3D, sceneAsParentNode=true):void {
        if(sceneAsParentNode==true) {
            this.addChild(camera); 
        }
        this.cameras.push(camera); 
    }

    // TODO: add some auto-adjust for "activeCamera?"
    removeCamera(camera:Camera3D):void {
        const index:number = this.cameras.indexOf(camera);
        if (index >= 0) {
            this.cameras.splice(index, 1);
            /* If camera is not a child of scene the call will just exit */
            this.removeChild(camera); 
        }
    }
    
    getActiveCamera():Camera3D {
        return this.cameras[this.activeCamera]; 
    }

    // TODO: add duplication checks 
    /**
     * 
     * @param worldMesh 
     * @param sceneAsParentNode if true, the cameras parent node will be set to the scene. 
     *                          Set to false if you have set another parent-node for the camera prior to calling this function.
     */
    addWorldMesh(worldMesh:WorldMesh, sceneAsParentNode=true):void {
        if(sceneAsParentNode==true) {
            this.addChild(worldMesh); 
        }
        this.worldMeshes.push(worldMesh); 
    }

    removeWorldMesh(worldMesh:WorldMesh):void {
        const index:number = this.worldMeshes.indexOf(worldMesh);
        if (index >= 0) {
            this.worldMeshes.splice(index, 1);
            this.removeChild(worldMesh); 
        }
    }
    
    /**
     * You can't overwrite an existing named light, that has to be removed first. 
     * (We do it this way as this can prevent some errors. Light names are supposed to be unique).  
     * 
     * @param light 
     * @param sceneAsParentNode 
     */
    addLight(light:BaseLight, sceneAsParentNode=true):boolean {
        if(this.lights[light.name]) {
            return false; 
        }

        if(sceneAsParentNode==true) {
            this.addChild(light); 
        }

        this.lights[light.name] = light; 

        return true; 
    }

    removeLight(light:BaseLight):void {
        if(this.lights[light.name]) {
            this.removeChild(this.lights[light.name]); 
        }

        delete this.lights[light.name]; 
    }

    addNamedEffect(name:string, effect2D:Effect2D):void {
        this.effects2D[name] = effect2D; 
    }
    
    /**
     * NOTES: 
     * - The effect must be added via addNamedEffect() before calling this function. 
     * - Remember to set doPostProcessing=true to activate the post processing. 
     * NOTE: This does not prevent you from adding one effect multiple times! 
     * @param name 
     */
    addPostProcessingEffect(name:string):void {
        const effect = this.effects2D[name]; 
        if(effect) {
            this._postProcessingEffects.push(effect); 
        }
    }

    removePostProcessingEffect(name:string):void {
        const effect = this.effects2D[name]; 
        if(effect) {
            const index:number = this._postProcessingEffects.indexOf(effect);
            if (index >= 0) {
                this._postProcessingEffects.splice(index, 1); 
            }
        }
    }

    /**
     * 
     * @param uuidSceneGraph adjacency list { uuid:[uuids] }
     * @param uuidToReference { uuidString:objReference }
     */
    initSceneGraph(uuidSceneGraph:Record<string,string[]>, uuidToReference:Record<string,Node>):void {
        for(const uuidParent in uuidSceneGraph) {
            const parent = uuidToReference[uuidParent]; 
            for(let i=0; i<uuidSceneGraph[uuidParent].length; ++i) {
                const uuidChild = uuidSceneGraph[uuidParent][i]; 
                const child = uuidToReference[uuidChild]; 
                parent.addChild(child);
            }
        }
    }
    
    // TODO: add some duplicate checks here? 
    /**
     * Use this to link all loaded uuid's to their object references. Needed to wire up the scene graph (as this is stored separately when serializing). 
     * @returns {uuid:NodeObject}: links every Node object in the scene to its uuid
     */
    matchUUIDToReference():Record<string,Node> {
        const retList:Record<string,Node> = {}; 

        retList[this.uuid] = this; 

        for(let i=0; i<this.cameras.length; i++) {
            retList[this.cameras[i].uuid] = this.cameras[i]; 
        }

        for(let i=0; i<this.worldMeshes.length; i++) {
            retList[this.worldMeshes[i].uuid] = this.worldMeshes[i]; 
        }

        return retList; 
    }

    jsonifyCameras():string {
        const arr:string[] = [];
        for(let i=0; i<this.cameras.length; ++i) {
            arr.push(this.cameras[i].jsonify()); 
        } 

        return JSON.stringify(arr); 
    }

    // TODO: this is a duplicate of jsonifyCameras() lol
    jsonifyWorldMeshes():string {
        const arr:string[] = [];
        for(let i=0; i<this.worldMeshes.length; ++i) {
            arr.push(this.worldMeshes[i].jsonify()); 
        } 

        return JSON.stringify(arr); 
    }

    jsonifyUUIDSceneGraph():string {
        const sceneGraph:Record<string,string[]> = {}; 
        /* The scene is the root object for the scene graph */
        this.createUUIDSceneGraph(sceneGraph); 
        return JSON.stringify(sceneGraph); 
    }

    
    getTextureURLs():Set<string> {
        const urls = new Set<string>(); 

        for(let i=0; i<this.worldMeshes.length; ++i) {
            const meshURLs = this.worldMeshes[i].materialTextureURLs; 
            meshURLs.forEach(urls.add, urls); 
        } 

        return urls; 
    }


    jsonify():string {
        const proto:Record<string,unknown>= {}; 

        proto.super = super.jsonify(); 
        proto.activeCamera = this.activeCamera; 

        proto.uuidSceneGraph = this.jsonifyUUIDSceneGraph(); 
        
        proto.cameras = this.jsonifyCameras(); 
        proto.worldMeshes = this.jsonifyWorldMeshes(); 
        
        return JSON.stringify(proto); 
    }

    
    public static createFromJSON(json:string):Scene {
        const settings = JSON.parse(json); 

        const instance = new Scene(settings.name, settings.uuid); 

        /* Node superclass settings */
        instance.setNodeFromJSON(settings.super); 
        instance.activeCamera = settings.activeCamera; 
        const cameraSettings = JSON.parse(settings.cameras); 
        
        for(let i=0; i< cameraSettings.length; i++) {
            const camera = Camera3D.createFromJSON(cameraSettings[i]); 
            instance.addCamera(camera); 
        }
        
        const worldMeshSettings = JSON.parse(settings.worldMeshes); 

        for(let i=0; i< worldMeshSettings.length; i++) {
            const worldMesh = WorldMesh.createFromJSON(worldMeshSettings[i]); 
            instance.addWorldMesh(worldMesh); 
        }
        
        /* Wire up scene graph. This is ofc done after all objects have been initialized add added to the scene lol */
        const uuidToNodeReferences:Record<string,Node> = instance.matchUUIDToReference(); 
        const uuidSceneGraph = JSON.parse(settings.uuidSceneGraph); 
        instance.initSceneGraph(uuidSceneGraph, uuidToNodeReferences); 
        
        return instance; 
    }
}
