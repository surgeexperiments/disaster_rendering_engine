import { expect } from 'chai'; 
import { GLShader, AttribList, UniformList } from "../../src/materials/GLShader";
import { compareObjectsJSON } from "../utils/comparisonFunctions"
import { createExampleUniformList, createExampleAttribList, getGLShaderAndInitParams } from "./util"

/**
 * TODO: 
 * - Tests for setAllUniformUpdateTrue() ?
 */

describe('GLShader tests', () => {
    const uniformList:UniformList = createExampleUniformList(); 
    const attribList:AttribList = createExampleAttribList(); 

    const testData = getGLShaderAndInitParams("uuid_test", 1 as WebGLProgram, uniformList, attribList); 

    const glShader = testData.instance as GLShader; 
    const params = testData.params; 
    
    
    it('default options', () => {
        expect(glShader.uuid).to.equal(params.uuid); 
        expect(glShader.program).to.equal(params.program); 
        expect(compareObjectsJSON(uniformList, glShader.uniforms)).to.equal(true); 
        expect(compareObjectsJSON(attribList, glShader.attribs)).to.equal(true); 
    }); 
    
    /* We do not want GLShader to store and work with the references for uniformList and attribList,
       as any change would effect every instance sharing the reference. 
     */
    it('verify that uniformList was deep copied, and not just stored as a reference', () => {
        uniformList.worldMatrix.type = "mat333"; 
        expect(compareObjectsJSON(uniformList, glShader.uniforms)).to.equal(false); 
        uniformList.worldMatrix.type = "mat4"; 
        expect(compareObjectsJSON(uniformList, glShader.uniforms)).to.equal(true); 
    }); 
    

    it('verify that attribList was deep copied', () => {
        attribList.normal.type = "vec4444";
        expect(compareObjectsJSON(attribList, glShader.attribs)).to.equal(false); 
        attribList.normal.type = "vec3"; 
        expect(compareObjectsJSON(attribList, glShader.attribs)).to.equal(true); 
    }); 

    it('getAttribLocation()', () => {
        expect(glShader.getAttribLocation("position")).to.equal(1); 
        expect(glShader.getAttribLocation("normal")).to.equal(2); 
        expect(glShader.getAttribLocation("nonExistent")).to.equal(null); 
    }); 

    it('getUniformLocation()', () => {
        expect(glShader.getUniformLocation("worldMatrix")).to.equal(0); 
        expect(glShader.getUniformLocation("color")).to.equal(1); 
        expect(glShader.getUniformLocation("texture")).to.equal(2); 
        expect(glShader.getUniformLocation("nonExistent")).to.equal(null); 
    }); 

    it('setUniformValue() / getUniformValue() / setAllUniformUpdateFalse()', () => {
        glShader.setUniformValue("worldMatrix", new Float32Array([6, 7, 8, 9])); 
        const _uniformList = glShader.uniforms; 
        /* Original value */
        expect(compareObjectsJSON(glShader.getUniformValue("worldMatrix"), new Float32Array([1, 2, 3, 4]))).to.equal(false); 
        expect(compareObjectsJSON(_uniformList.worldMatrix.value, new Float32Array([1, 2, 3, 4]))).to.equal(false); 
        /* Correct value */
        expect(compareObjectsJSON(glShader.getUniformValue("worldMatrix"), new Float32Array([6, 7, 8, 9]))).to.equal(true); 
        expect(compareObjectsJSON(_uniformList.worldMatrix.value, new Float32Array([6, 7, 8, 9]))).to.equal(true); 

        expect(_uniformList.worldMatrix.update).to.equal(true); 
        glShader.setAllUniformUpdateFalse(); 
        expect(_uniformList.worldMatrix.update).to.equal(false); 
    }); 

    it('clone()', () => {
        const glShaderClone = glShader.clone(); 
        expect(compareObjectsJSON(glShader, glShaderClone)).to.equal(true);    
    });
}); 