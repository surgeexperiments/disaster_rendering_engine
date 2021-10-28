import { expect } from 'chai'; 
import { GLArrayBuffer, GLElementBuffer} from "../../src/mesh/GLBuffer";
import { DrawBufferArrayType, DrawBufferOptimizationType } from "../../src/constants/constants"

import { compareArrayBufferToClone, compareElementBufferToClone } from "./comparisonFunctions"


describe('GLArrayBuffer tests', () => {

    const drawType = DrawBufferOptimizationType.STATIC_DRAW;
    const length = 1000; 
    
    const glArrayBuffer = new GLArrayBuffer(drawType, length); 
    

    it('default options', () => {
        expect(glArrayBuffer.arrayType).to.equal(DrawBufferArrayType.ARRAY_BUFFER); 
        expect(glArrayBuffer.drawType).to.equal(drawType); 
        expect(glArrayBuffer.length).to.equal(length); 
        expect(glArrayBuffer.bufferSet).to.equal(false); 
        expect(glArrayBuffer.shaderAttribRefSet).to.equal(false); 
        expect(glArrayBuffer.isGLInitialized).to.equal(false); 
    }); 
    
    
    it('set buffer()', () => {
        const _buf = 1 as WebGLBuffer; 
        glArrayBuffer.buffer = _buf;  
        expect(glArrayBuffer.buffer).to.equal(_buf); 
        expect(glArrayBuffer.bufferSet).to.equal(true); 
        expect(glArrayBuffer.isGLInitialized).to.equal(false); 
    }); 


    it('set shaderAttribRef()', () => {
        const _attribRef = 1 as number; 
        glArrayBuffer.shaderAttribRef = _attribRef; 
        expect(glArrayBuffer.shaderAttribRef).to.equal(_attribRef); 
        expect(glArrayBuffer.shaderAttribRefSet).to.equal(true); 
    }); 

    it('isGLInitialized()', () => {
        /* Should eval to true now that both buffer and shaderAttribRef is set */
        expect(glArrayBuffer.isGLInitialized).to.equal(true);  
    });

    it('setAttribPtrData(): check erroneous numComponents throws error', () => {
        /* Use arrow function to allow chai to catch the error */
        expect(() => glArrayBuffer.setAttribPtrData(0, false, 0, 0)).to.throw(Error);
    });

    it('setAttribPtrData()/numElements(): check values set ', () => {
        const _numComponents = 4; 
        const _normalize = true; 
        const _stride = 0; 
        const _offset = 0; 
        glArrayBuffer.setAttribPtrData(_numComponents, _normalize, _stride, _offset); 
        expect(glArrayBuffer.numComponents).to.equal(_numComponents); 
        expect(glArrayBuffer.normalize).to.equal(_normalize); 
        expect(glArrayBuffer.stride).to.equal(_stride); 
        expect(glArrayBuffer.offset).to.equal(_offset); 

        expect(glArrayBuffer.numElements).to.equal(length/_numComponents); 
    }); 

    it('json to/from', () => {
        const json:string = glArrayBuffer.jsonify(); 
        const glArrayBufferClone = GLArrayBuffer.createFromJSON(json); 
        
        /* The cloned item should have all these false */
        expect(glArrayBufferClone.bufferSet).to.equal(false); 
        expect(glArrayBufferClone.shaderAttribRefSet).to.equal(false); 
        expect(glArrayBufferClone.isGLInitialized).to.equal(false); 

        compareArrayBufferToClone(glArrayBuffer, glArrayBufferClone); 
    }); 
}); 




describe('GLElementBuffer tests', () => {

    const drawType = DrawBufferOptimizationType.STATIC_DRAW;
    const length = 1000; 

    const glElementBuffer = new GLElementBuffer(drawType, length); 
    

    it('default options', () => {
        expect(glElementBuffer.arrayType).to.equal(DrawBufferArrayType.ELEMENT_ARRAY_BUFFER); 
        expect(glElementBuffer.drawType).to.equal(drawType); 
        expect(glElementBuffer.length).to.equal(length); 
        expect(glElementBuffer.bufferSet).to.equal(false); 
        expect(glElementBuffer.isGLInitialized).to.equal(false); 
        expect(glElementBuffer.offset).to.equal(0); 
    }); 
    
    it('set offset()', () => {
        const _offset = 3;
        glElementBuffer.offset = _offset; 
        expect(glElementBuffer.offset).to.equal(_offset); 
    }); 
    
    it('set buffer()/glInitialized()', () => {
        const _buf = 1 as WebGLBuffer; 
        glElementBuffer.buffer = _buf;  
        expect(glElementBuffer.buffer).to.equal(_buf); 
        expect(glElementBuffer.bufferSet).to.equal(true); 
        expect(glElementBuffer.isGLInitialized).to.equal(true); 
    }); 


    it('json to/from', () => {
        const json:string = glElementBuffer.jsonify(); 
        const glElementBufferClone = GLElementBuffer.createFromJSON(json); 
        
        /* The cloned item should have all these false */
        expect(glElementBufferClone.bufferSet).to.equal(false); 
        expect(glElementBufferClone.isGLInitialized).to.equal(false); 

        compareElementBufferToClone(glElementBuffer, glElementBufferClone); 
    }); 
}); 