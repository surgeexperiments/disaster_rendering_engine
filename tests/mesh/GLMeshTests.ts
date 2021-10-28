import { expect } from 'chai'; 
import { GLMesh } from "../../src/mesh/GLMesh"
import { GLArrayBuffer, GLElementBuffer} from "../../src/mesh/GLBuffer";
import { DrawBufferOptimizationType, DrawStaticPrimitiveType } from "../../src/constants/constants"

import { compareGLMeshToClone } from "./comparisonFunctions"
import { getArrayBufferAndInitParams, getIndexBufferAndInitParams } from "./util"

describe('GLMesh2 tests', () => {
    const drawMode = DrawStaticPrimitiveType.TRIANGLES; 

    const glMesh = new GLMesh(drawMode); 

    /* Params for all GLArrayBuffers. These are already covered in GLBufferTests so no need  */
    const numComponents = 4; 
    const normalize = true; 
    const stride = 0; 
    const offset = 3; 
    

    it('default options', () => {
        expect(glMesh.drawMode).to.equal(drawMode); 
        expect(glMesh.isIndexDraw).to.equal(false); 
    }); 
    
    
    it('set get vao()', () => {
        const vao = 1 as WebGLVertexArrayObject; 
        glMesh.vao = vao;
        expect(glMesh.vao).is.equal(vao); 
    }); 
    

    it('set get drawMode()', () => {
        const newDrawMode = DrawStaticPrimitiveType.LINES;
        glMesh.drawMode = newDrawMode; 
        expect(glMesh.drawMode).to.equal(newDrawMode); 
        glMesh.drawMode = drawMode; 
        expect(glMesh.drawMode).to.equal(drawMode); 
    }); 
    
    it('set get drawArrStartIndex()', () => {
        const newDrawArrStartIndex = 3;
        const standardDrawArrStartIndex = 0;  
        glMesh.drawArrStartIndex = newDrawArrStartIndex;  
        expect(glMesh.drawArrStartIndex).to.equal(newDrawArrStartIndex);
        glMesh.drawArrStartIndex = standardDrawArrStartIndex;  
        expect(glMesh.drawArrStartIndex).to.equal(standardDrawArrStartIndex); 
    }); 

    
    it('set get position() + json/serializing test', () => {
        const _positionLength = 1000; 

        const _glPositionBuffer = getArrayBufferAndInitParams(DrawBufferOptimizationType.DYNAMIC_DRAW, _positionLength, numComponents, 
                                                              normalize, stride, offset).instance as GLArrayBuffer; 
        
        const _glDrawType = 99; 
        _glPositionBuffer.glDrawType = _glDrawType; 

        glMesh.setArrayBuffer("position",_glPositionBuffer); 

        const json = glMesh.jsonify(); 

        const _glMeshClone = GLMesh.createFromJSON(json); 

        compareGLMeshToClone(glMesh, _glMeshClone);  

        /* These will be modified by position */
        const _numDrawElements = _positionLength/numComponents;
        expect(glMesh.getNumDrawElements()).to.equal(_numDrawElements); 
        expect(glMesh.getGLDrawType()).to.equal(_glDrawType); 
        expect(glMesh.getBufOffset()).to.equal(offset); 
    }); 
    
    it('set get normal() + json/serializing test', () => {
        const _glNormalBuffer = getArrayBufferAndInitParams(DrawBufferOptimizationType.STREAM_DRAW, 2000, numComponents, 
                                                            normalize, stride, offset).instance as GLArrayBuffer; 

        glMesh.setArrayBuffer("normal", _glNormalBuffer); 

        const json = glMesh.jsonify(); 

        const _glMeshClone = GLMesh.createFromJSON(json); 

        compareGLMeshToClone(glMesh, _glMeshClone);  
    });

    it('set get tangent() + json/serializing test', () => {
        const _glTangentBuffer = getArrayBufferAndInitParams(DrawBufferOptimizationType.DYNAMIC_DRAW, 2000, numComponents, 
                                                            normalize, stride, offset).instance as GLArrayBuffer; 
        
        glMesh.setArrayBuffer("tangent", _glTangentBuffer); 

        const json = glMesh.jsonify(); 

        const _glMeshClone = GLMesh.createFromJSON(json); 

        compareGLMeshToClone(glMesh, _glMeshClone);   
    })


    it('set get texCoord() + json/serializing test', () => {
        const _glTexCoordBuffer = getArrayBufferAndInitParams(DrawBufferOptimizationType.STATIC_DRAW, 1000, numComponents, 
                                                              normalize, stride, offset).instance as GLArrayBuffer; 
        
        glMesh.setArrayBuffer("texCoord", _glTexCoordBuffer); 

        const json = glMesh.jsonify(); 

        const _glMeshClone = GLMesh.createFromJSON(json); 

        compareGLMeshToClone(glMesh, _glMeshClone);  
    });
    
    
    it('set get indices() + json/serializing test', () => {
        const testData = getIndexBufferAndInitParams(DrawBufferOptimizationType.DYNAMIC_DRAW, 1000, offset); 
        const _glIndicesBuffer = testData.instance as GLElementBuffer; 
        const testParams = testData.params; 
        
        const _glDrawType = 1000; 
        _glIndicesBuffer.glDrawType = _glDrawType; 
        
        glMesh.indices =_glIndicesBuffer; 
        
        const json = glMesh.jsonify(); 

        const _glMeshClone = GLMesh.createFromJSON(json); 

        compareGLMeshToClone(glMesh, _glMeshClone);  

        /* These will be modified by position */
        expect(glMesh.getNumDrawElements()).to.equal(testParams.length); 
        expect(glMesh.getGLDrawType()).to.equal(_glDrawType); 
        expect(glMesh.getBufOffset()).to.equal(testParams.offset);  
    });
}); 




