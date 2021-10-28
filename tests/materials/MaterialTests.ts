import { expect } from 'chai'; 
import { TextureDataType, TextureFiltering, TexturePixelFormat, TextureType } from "../../src/constants/constants"
import { GLShader, AttribList, UniformList } from "../../src/materials/GLShader";
import { GLTexture } from "../../src/materials/GLTexture";
import { Texture } from "../../src/materials/texture"
import { Material } from "../../src/materials/material"
import { compareMaterialToClone, compareTextureToClone } from "./comparisonFunctions"
import { compareObjectsJSON } from "../utils/comparisonFunctions"
import { createExampleUniformList, createExampleAttribList, getGLShaderAndInitParams } from "./util"

import { getGLTextureAndInitParams, getTextureAndInitParams,  } from './util';

/**
 * Note: could have split the tests for setWrappingOptions() and json to/from 
 * into separate tests for 2D and 3D. For now it just seems messy. 
 */
describe('Material tests', () => {
    const name = "materialTest";  
    const uuid = "materialUUID"; 
    const material = new Material(name, uuid); 

    const glTexture = getGLTextureAndInitParams(0, TexturePixelFormat.RGBA, TexturePixelFormat.RGBA, 
                                                TextureDataType.FLOAT, TextureType.TEXTURE_2D, true).instance as GLTexture; 

    const webGLTexture = 99 as WebGLTexture; 
    glTexture.texture = webGLTexture; 
    
    const texture = getTextureAndInitParams("TestTexture2DName", glTexture, TextureFiltering.BI_LINEAR, 
                        TextureFiltering.NEAREST, false).instance as Texture; 
    
    const uniformList:UniformList = createExampleUniformList(); 
    const attribList:AttribList = createExampleAttribList(); 
    
    const glShader = getGLShaderAndInitParams("uuid_test", 1 as WebGLProgram, uniformList, attribList).instance as GLShader; 

    material.shader = glShader; 
    
    
    it('default options', () => {
        expect(material.name).to.equal(name); 
        expect(material.uuid).to.equal(uuid); 
        expect(material.isTransparent).to.equal(false); 
        expect(material.skinning).to.equal(false); 

        /* Material has requirement "basic" set by default */
        expect(material.requirements.size).to.equal(1); 
        expect(material.texture).to.undefined; 
        expect(material.color).to.undefined; 
    }); 
    
    it('default options: verify that when the uuid param is not given it is automatically set', () => {
        const _material = new Material("testMaterial"); 
        expect(_material.uuid).to.not.undefined;   
        expect(_material.uuid.length).to.be.above(0); 
    });

    it('set requirements', () => {
        const requirements = new Set<string>(); 
        /* Material has basic set by default */
        requirements.add("basic"); 
        requirements.add("texture"); 
        material.addRequirement("texture"); 
        expect(compareObjectsJSON(material.requirements, requirements)).to.equal(true); 
    }); 
    
    /* Clearly this test breaks if the standard shader-name for color changes. This name is expected to be extremely resilient to change, and I want this test
     * to break if it for some reason changes haha. 
     */
    it('set color', () => {
        const color = new Float32Array([1, 2, 3, 1]); 
        material.color = color; 
        expect(compareObjectsJSON(material.color, color)).to.equal(true); 
        const glShader = material.shader; 
        expect(compareObjectsJSON(glShader.getUniformValue("color"), color)).to.equal(true);
    });
    
    it('set texture', () => {
        material.texture = texture; 
        compareTextureToClone(material.texture, texture); 
        // TODO: remove or add
        //expect(compareObjectsJSON(glShader.getUniformValue("texture"), webGLTexture)).to.equal(true);
    });



    /* After this test glTexture.textureSet will be true */
    it('jsonify/createFromJSON()', () => {
        const json = material.jsonify(); 
        const materialClone = Material.createFromJSON(json); 
        
        compareMaterialToClone(material, materialClone);
    });        
}); 