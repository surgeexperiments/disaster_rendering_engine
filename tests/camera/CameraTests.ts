import { expect } from 'chai'; 
import { mat4, vec3 } from "../../src/math/gl-matrix" 

import { Camera3D } from "../../src/camera/camera";
import { compareCameras } from "./comparisonFunctions"


/**
 * Note: could have split the tests for setWrappingOptions() and json to/from 
 * into separate tests for 2D and 3D. For now it just seems messy. 
 */
 describe('Camera tests', () => {

    const name = "testCamera"; 
    const uuid = "testCameraUUID"; 
    
    const camera = new Camera3D(name, uuid); 
    

    it('default options', () => {
        expect(camera.name).to.equal(name); 

        expect(vec3.equals(camera.upVec, vec3.fromValues(0, 1, 0))).to.equal(true);
        expect(mat4.equals(camera.viewMatrix, mat4.create())).to.equal(true); 
        expect(mat4.equals(camera.projectionMatrix, mat4.create())).to.equal(true); 
        expect(mat4.equals(camera.viewProjectionMatrix, mat4.create())).to.equal(true); 
    }); 
    
    it('default options: verify that when the uuid param is not given it is automatically set', () => {
        const _camera = new Camera3D(name); 
        expect(_camera.uuid).to.not.undefined;   
        expect(_camera.uuid.length).to.be.above(0); 
    });

    it('jsonify()/createFromJSON()', () => {
        const json = camera.jsonify(); 
        const clone = Camera3D.createFromJSON(json); 
        compareCameras(camera, clone); 
    }); 

    it('TODO: setLookAt()', () => {
        console.log("unfinished"); 
    }); 

    it('TODO: createPerspectiveMatrixRadians()', () => {
        console.log("unfinished"); 
    }); 

    it('TODO: createPerspectiveMatrixDegrees()', () => {
        console.log("unfinished"); 
    }); 

    it('TODO: createOrthographicMatrix()', () => {
        console.log("unfinished"); 
    }); 

    it('TODO: boxInFrustrum()', () => {
        console.log("unfinished"); 
    }); 

    it('TODO: sphereInFrustrum()', () => {
        console.log("unfinished"); 
    }); 

    it('TODO: pointInFrustrum()', () => {
        console.log("unfinished"); 
    }); 

    it('TODO: boxInFrustrum()', () => {
        console.log("unfinished"); 
    }); 

    it('TODO: _createFrustrumPositionBufferLocalSpace()', () => {
        console.log("unfinished"); 
    });
}); 


