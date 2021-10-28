import { expect } from 'chai'; 
import { WorldMesh } from "../../src/mesh/WorldMesh"; 
import { GLArrayBuffer, GLElementBuffer} from "../../src/mesh/GLBuffer";
import { DrawBufferOptimizationType, DrawStaticPrimitiveType } from "../../src/constants/constants"

import { compareWorldMeshToClone } from "./comparisonFunctions"

import { getArrayBufferAndInitParams, getIndexBufferAndInitParams } from "./util"

import { indices, vertices } from "./testBuffers"
import { MeshBuffersAndGLBuffers } from '../../src/mesh/IMeshObject';

/**
 * Tests not implemented
 * - material set/get/compare 
 * - Buffers set/get/compare 
 * - set/get glmesh 
 */
describe('WorldMesh tests', () => {
    const name = "worldMeshName"; 
    const uuid = "worldMeshUUID"; 
    const drawMode = DrawStaticPrimitiveType.TRIANGLES; 

    const worldMesh = new WorldMesh(name, drawMode, uuid); 
    

    it('default options', () => {
        expect(worldMesh.name).to.equal(name); 
        expect(worldMesh.uuid).to.equal(uuid); 
        expect(worldMesh.drawMode).to.equal(drawMode); 

        expect(worldMesh.position).to.undefined; 
        expect(worldMesh.normal).to.undefined; 
        expect(worldMesh.tangent).to.undefined; 
        expect(worldMesh.texCoord).to.undefined; 
        expect(worldMesh.indices).to.undefined; 
        
        expect(worldMesh.material).to.undefined; 
    }); 

    it('default options: verify that when the uuid param is not given it is automatically set', () => {
        const _worldMesh = new WorldMesh(name, drawMode); 
        expect(_worldMesh.uuid).to.not.undefined;   
        expect(_worldMesh.uuid.length).to.be.above(0);
    });

    it('returnBuffersAndGLBuffers()/returnUnsetBuffersAndGLBuffers(): no buffers set', () => {
        const allSetBuffers:MeshBuffersAndGLBuffers = worldMesh.returnBuffersAndGLBuffers(); 
        expect(Object.keys(allSetBuffers).length).to.equal(0); 

        const unsetBuffers:MeshBuffersAndGLBuffers = worldMesh.returnUnsetBuffersAndGLBuffers(); 
        expect(Object.keys(unsetBuffers).length).to.equal(0); 
    }); 

    
    it('setArrayBufferWithGLUpdate()/returnBuffersAndGLBuffers(): position buffer set', () => {
        const importedBuffer = vertices;  
        const _glPosition = getArrayBufferAndInitParams(DrawBufferOptimizationType.STATIC_DRAW, 2000, 3, 
                                                        false, 0, 0).instance as GLArrayBuffer; 

        worldMesh.setArrayBufferWithGLUpdate("position", importedBuffer, _glPosition); 

        const allSetBuffers:MeshBuffersAndGLBuffers = worldMesh.returnBuffersAndGLBuffers(); 
        expect(Object.keys(allSetBuffers).length).to.equal(1); 

        /* Test for correct bufferSet will be done in LayerBuffer */
        const unsetBuffers:MeshBuffersAndGLBuffers = worldMesh.returnUnsetBuffersAndGLBuffers(); 
        expect(Object.keys(unsetBuffers).length).to.equal(1); 
        
    }); 
    
    
    it('setArrayBufferWithGLUpdate()/returnBuffersAndGLBuffers(): indices buffer set', () => {
        const importedBuffer = indices; 
        const glElementBuffer = getIndexBufferAndInitParams(DrawBufferOptimizationType.DYNAMIC_DRAW, 1000, 0).instance as GLElementBuffer;  

        worldMesh.setIndexBufferWithGLUpdate(importedBuffer, glElementBuffer); 

        const allSetBuffers:MeshBuffersAndGLBuffers = worldMesh.returnBuffersAndGLBuffers(); 
        expect(Object.keys(allSetBuffers).length).to.equal(2); 

        /* Test for correct bufferSet will be done in LayerBuffer */
        const unsetBuffers:MeshBuffersAndGLBuffers = worldMesh.returnUnsetBuffersAndGLBuffers(); 
        expect(Object.keys(unsetBuffers).length).to.equal(2); 
    });
    

    it('jsonify() / createFromJSON()', () => {
        const json = worldMesh.jsonify(); 

        const _worldMeshClone = WorldMesh.createFromJSON(json); 

        compareWorldMeshToClone(worldMesh, _worldMeshClone); 
    });
}); 




