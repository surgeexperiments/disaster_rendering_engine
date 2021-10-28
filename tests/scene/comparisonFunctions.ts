import { expect } from 'chai'; 
import { Scene } from "../../src/scene/scene"
import { Camera3D } from "../../src/camera/camera";
import { WorldMesh } from "../../src/mesh/WorldMesh";

import { compareObjectsJSON } from "../utils/comparisonFunctions"

import { compareCameras} from "../camera/comparisonFunctions"; 
import { compareWorldMeshToClone } from "../mesh/comparisonFunctions"; 


export function compareSceneToClone(one:Scene, two:Scene):void {
    expect(one.name).to.equal(two.name); 
    expect(one.uuid).to.equal(two.uuid); 
    expect(one.activeCamera).to.equal(two.activeCamera); 

    compareCameraArrays(one.cameras, two.cameras); 

    compareWorldMeshArrays(one.worldMeshes, two.worldMeshes); 
    
    /* Pretty easy to compare scene graphs via uuid's as long as we have tested that the generated scene graph mirrors the actual adjacency list */
    const uuidSceneGraphOne:Record<string,string[]> = {}; 
    const uuidSceneGraphTwo:Record<string,string[]> = {}; 

    one.createUUIDSceneGraph(uuidSceneGraphOne); 
    one.createUUIDSceneGraph(uuidSceneGraphTwo); 
    
    compareObjectsJSON(uuidSceneGraphOne, uuidSceneGraphTwo);  
}

/**
 * NOTE: depends on the order being the same.
 */
function compareCameraArrays(one:Camera3D[], two:Camera3D[]):void {
    expect(one.length).to.equal(two.length); 
    for(let i=0; i<one.length; ++i) {
        compareCameras(one[i], two[i]); 
    }
}

/**
 * NOTE: depends on the order being the same.
 */
function compareWorldMeshArrays(one:WorldMesh[], two:WorldMesh[]):void {
    expect(one.length).to.equal(two.length); 
    for(let i=0; i<one.length; ++i) {
        compareWorldMeshToClone(one[i], two[i]); 
    }
}