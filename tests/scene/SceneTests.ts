import { expect } from 'chai'; 
import { Scene } from "../../src/scene/scene"
import { Camera3D } from "../../src/camera/camera";
import { WorldMesh } from '../../src/mesh/WorldMesh';
import { DrawStaticPrimitiveType } from "../../src/constants/constants"

import { compareObjectsJSON } from "../utils/comparisonFunctions"
import { compareSceneToClone } from "./comparisonFunctions"

/**
 * Don't care about creating very complex WorldMeshes for jsonify/createFromJSON tests here.
 * The json-functionality for complex WorldMeshes have already been tested in the WorldMesh-tests. 
 */
describe('Scene tests', () => {
    const sceneName = "sceneName"; 
    const sceneUuid = "sceneUUID"; 
    
    const scene = new Scene(sceneName, sceneUuid); 

    const cameraName = "testCamera"; 
    const cameraUuid = "testCameraUUID"; 
    
    const camera = new Camera3D(cameraName, cameraUuid); 
    
    const worldMeshOneName = "worldMeshOneName"; 
    const worldMeshOneUuid = "worldMeshOneUUID"; 
    const drawMode = DrawStaticPrimitiveType.TRIANGLES;

    const worldMeshOne = new WorldMesh(worldMeshOneName, drawMode, worldMeshOneUuid);

    const worldMeshTwoName = "worldMeshTwoName"; 
    const worldMeshTwoUuid = "worldMeshTwoUUID"; 

    const worldMeshTwo = new WorldMesh(worldMeshTwoName, drawMode, worldMeshTwoUuid);
    

    it('default options', () => {
        expect(scene.name).to.equal(sceneName); 
        expect(scene.uuid).to.equal(sceneUuid);  
        expect(scene.activeCamera).to.equal(0); 
        expect(scene.cameras.length).to.equal(0); 
        expect(scene.worldMeshes.length).to.equal(0); 
    }); 

    it('default options: verify that when the uuid param is not given it is automatically set', () => {
        const _scene = new Scene(sceneName); 
        expect(_scene.uuid).to.not.undefined;   
        expect(_scene.uuid.length).to.be.above(0);
    });

    it('add/removeCamera() without sceneAsParent', () => {
        scene.addCamera(camera, false); 
        expect(scene.childNodes.length).to.equal(0); 
        expect(scene.cameras.length).to.equal(1); 
        expect(scene.cameras[0]).to.equal(camera); 

        scene.removeCamera(camera); 
        expect(scene.childNodes.length).to.equal(0); 
        expect(scene.cameras.length).to.equal(0); 
    }); 

    it('add/removeCamera() with sceneAsParent', () => {
        scene.addCamera(camera, true); 
        expect(scene.childNodes.length).to.equal(1); 
        expect(scene.childNodes[0]).to.equal(camera); 
        expect(scene.cameras.length).to.equal(1); 
        expect(scene.cameras[0]).to.equal(camera); 
        
        scene.removeCamera(camera); 
        expect(scene.childNodes.length).to.equal(0); 
        expect(scene.cameras.length).to.equal(0); 
    }); 

    it('add/removeWorldMesh() without sceneAsParent', () => {
        scene.addWorldMesh(worldMeshOne, false); 
        expect(scene.childNodes.length).to.equal(0); 
        expect(scene.worldMeshes.length).to.equal(1); 
        expect(scene.worldMeshes[0]).to.equal(worldMeshOne); 
        
        scene.removeWorldMesh(worldMeshOne); 
        expect(scene.childNodes.length).to.equal(0); 
        expect(scene.worldMeshes.length).to.equal(0); 
    }); 

    it('add/removeWorldMesh() with sceneAsParent', () => {
        scene.addWorldMesh(worldMeshOne, true); 
        expect(scene.childNodes.length).to.equal(1); 
        expect(scene.childNodes[0]).to.equal(worldMeshOne);
        expect(scene.worldMeshes.length).to.equal(1); 
        expect(scene.worldMeshes[0]).to.equal(worldMeshOne); 
        
        scene.removeWorldMesh(worldMeshOne); 
        expect(scene.childNodes.length).to.equal(0); 
        expect(scene.worldMeshes.length).to.equal(0); 
    });

    it('getTextureURLs(): TODO', () => {
        console.log("UNFINISHED"); 
    });

    
    it('matchUUIDToReference()', () => {
        scene.addCamera(camera, true);
        scene.addWorldMesh(worldMeshOne, true); 
        const expectedUUIDToReference:Record<string,unknown> = {};
        expectedUUIDToReference[sceneUuid] = scene; 
        expectedUUIDToReference[cameraUuid] = camera;
        expectedUUIDToReference[worldMeshOneUuid] = worldMeshOne;

        const uuidToReference = scene.matchUUIDToReference(); 
        
        // TODO: this is vulnerable because compareObjectsJSON depends on the order of keys. Change to a better comparison function. 
        expect(compareObjectsJSON(expectedUUIDToReference, uuidToReference)).to.equal(true); 

        /* Clean up */
        scene.removeCamera(camera);
        scene.removeWorldMesh(worldMeshOne); 
    });

    /**
     * Add objects without any scene-graph. Then create a uuid-scene-graph and ensure 
     * that it gets wired up as expected. 
     * 
     */
    it('initSceneGraph()', () => {
        scene.addCamera(camera, false);
        scene.addWorldMesh(worldMeshOne, false); 
        scene.addWorldMesh(worldMeshTwo, false); 
        expect(scene.childNodes.length).to.equal(0); 

        /**
         * Scene graph: 
         * Scene -> camera
         * Scene -> worldMeshOne -> worldMeshTwo 
         */
        const uuidSceneGraph:Record<string,string[]> = {}; 
        uuidSceneGraph[sceneUuid] = [cameraUuid, worldMeshOneUuid];
        uuidSceneGraph[worldMeshOneUuid] = [worldMeshTwoUuid]; 
        
        const uuidToReference = scene.matchUUIDToReference();

        scene.initSceneGraph(uuidSceneGraph, uuidToReference);

        // TODO: This could be done better haha. Just a quick hack, we update later. 
        expect(scene.childNodes.length).to.equal(2); 
        expect(scene.childNodes[0]).to.equal(camera); 
        expect(scene.childNodes[1]).to.equal(worldMeshOne); 

        expect(camera.childNodes.length).to.equal(0); 

        expect(worldMeshOne.childNodes.length).to.equal(1); 
        expect(worldMeshOne.childNodes[0]).to.equal(worldMeshTwo);

        expect(worldMeshTwo.childNodes.length).to.equal(0); 

        /* Clean up and verify that it worked */
        scene.removeCamera(camera);
        scene.removeWorldMesh(worldMeshOne); 
        scene.removeWorldMesh(worldMeshTwo);
        expect(scene.childNodes.length).to.equal(0); 
    });
    
    
    it('jsonify() / createFromJSON()', () => {
        scene.addCamera(camera, true);
        scene.addWorldMesh(worldMeshOne, true); 
        /* already linked up to worldMeshTwo */
        scene.addWorldMesh(worldMeshTwo, false); 
        const json = scene.jsonify(); 

        const sceneClone = Scene.createFromJSON(json); 

        compareSceneToClone(scene, sceneClone); 
    });
}); 




