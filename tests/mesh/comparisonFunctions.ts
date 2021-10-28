import { expect } from "chai";
import { GLArrayBuffer, GLElementBuffer } from "../../src/mesh/GLBuffer";
import { WorldMesh } from "../../src/mesh/WorldMesh";

import { compareObjectsJSON } from "../utils/comparisonFunctions"
import { compareNodesJsonifyFields } from "../node/comparisonFunctions"

import { compareMaterialToClone } from "../materials/comparisonFunctions"
import { GLMesh } from "../../src/mesh/GLMesh";
import { Material } from "../../src/materials/material";


export function compareArrayBufferToClone(one:GLArrayBuffer, two:GLArrayBuffer):void {
    expect(one.arrayType).to.equal(two.arrayType); 
    expect(one.drawType).to.equal(two.drawType); 
    expect(one.length).to.equal(two.length); 

    expect(one.numComponents).to.equal(two.numComponents); 
    expect(one.normalize).to.equal(two.normalize); 
    expect(one.stride).to.equal(two.stride); 
    expect(one.offset).to.equal(two.offset); 

    expect(one.numElements).to.equal(two.numElements); 
}


export function compareElementBufferToClone(one:GLElementBuffer, two:GLElementBuffer):void {

    expect(one.arrayType).to.equal(two.arrayType); 
    expect(one.drawType).to.equal(two.drawType); 
    expect(one.length).to.equal(two.length); 

    expect(one.offset).to.equal(two.offset); 

    expect(one.numElements).to.equal(two.numElements); 
}

/*
export function compareGLMeshToClone(one:GLMesh, two:GLMesh):void {
    expect(one.drawMode).to.equal(two.drawMode); 
    expect(one.isIndexDraw).to.equal(two.isIndexDraw); 
    if(one.position || two.position) {
        compareArrayBufferToClone(one.position, two.position);
    }

    if(one.normal || two.normal) {
        compareArrayBufferToClone(one.normal, two.normal);
    }

    if(one.tangent || two.tangent) {
        compareArrayBufferToClone(one.tangent, two.tangent);
 
    }

    if(one.texCoord || two.texCoord) {
        compareArrayBufferToClone(one.texCoord, two.texCoord); 
    }

    if(one.indices || two.indices) {
        compareElementBufferToClone(one.indices, two.indices); 
        expect(one.isIndexDraw).to.equal(true); 
        expect(two.isIndexDraw).to.equal(true);
    }
}
*/

export function compareGLMeshToClone(one:GLMesh, two:GLMesh):void {
    expect(one.drawMode).to.equal(two.drawMode); 
    expect(one.isIndexDraw).to.equal(two.isIndexDraw); 

    const oneArrBuf = one.getArrayBuffers(); 
    const twoArrBuf = two.getArrayBuffers(); 
    expect(Object.keys(oneArrBuf).length).to.equal(Object.keys(twoArrBuf).length);

    for(const key in oneArrBuf) {
        expect(twoArrBuf[key]).to.not.equal(undefined); 
        compareArrayBufferToClone(oneArrBuf[key], twoArrBuf[key]); 
    }
    
    if(one.indices || two.indices) {
        compareElementBufferToClone(one.indices, two.indices); 
        expect(one.isIndexDraw).to.equal(true); 
        expect(two.isIndexDraw).to.equal(true);
    }
}

export function compareWorldMeshToClone(one:WorldMesh, two:WorldMesh):void {
    
    expect(one.drawMode).to.equal(two.drawMode);
    expect(one.castShadows).to.equal(two.castShadows);
    
    compareNodesJsonifyFields(one, two); 

    compareGLMeshToClone(one.glMesh, two.glMesh); 

    if(one.material || two.material) {
        // TODO: ugly hack. Remove.
        compareMaterialToClone(one.material as Material, two.material as Material); 
    }
    
    if(one.position || two.position) {
        compareObjectsJSON(one.position, two.position); 
    }  

    if(one.normal || two.normal) {
        compareObjectsJSON(one.normal, two.normal); 
    }

    if(one.tangent || two.tangent) {
        compareObjectsJSON(one.tangent, two.tangent); 
    }

    if(one.texCoord || two.texCoord) {
        compareObjectsJSON(one.texCoord, two.texCoord); 
    }

    if(one.indices || two.indices) {
        compareObjectsJSON(one.indices, two.indices); 
    }
}