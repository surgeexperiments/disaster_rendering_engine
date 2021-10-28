import { expect } from 'chai'; 
import { GLTexture } from "../../src/materials/GLTexture";
import { Material } from '../../src/materials/material';
import { Texture } from "../../src/materials/texture";
import { compareObjectsJSON, compareStringSets } from '../utils/comparisonFunctions';

// TODO: if needed, switch comparison functions to the Lodash function isEqual() 
// https://github.com/lodash/lodash/blob/4.17.15/lodash.js#L6839 

/**
 * When using jsonify()/createFromJSON() you only clone some values. Things like GL-values are not kept, 
 * which precludes the use of things like to.deep.equal from chai to compare an instance and its clone. 
 * 
 * This function allows you to verify that a GLTexture is equal as its clone, regardless of if
 * the WebGLTexture and gl values are set in one or both instances.  
 * 
 * @param glTexOne 
 * @param glTexTwo 
 * @returns 
 */
export function compareGLTextureToClone(glTexOne:GLTexture, glTexTwo:GLTexture):void {
    expect(glTexOne.level).to.equal(glTexTwo.level); 
    expect(glTexOne.internalFormat).to.equal(glTexTwo.internalFormat); 
    expect(glTexOne.format).to.equal(glTexTwo.format); 
    expect(glTexOne.type).to.equal(glTexTwo.type); 
    expect(glTexOne.target).to.equal(glTexTwo.target); 
    expect(glTexOne.flipYAxis).to.equal(glTexTwo.flipYAxis); 
    //if(glTexOne.level != glTexTwo.level) {return false;}
    //if(glTexOne.internalFormat != glTexTwo.internalFormat) {return false;}
    //if(glTexOne.format != glTexTwo.format) {return false;}
    //if(glTexOne.type != glTexTwo.type) {return false;}

    //if(glTexOne.target != glTexTwo.target) {return false;}
    //if(glTexOne.flipYAxis != glTexTwo.flipYAxis) {return false;} 
}

/**
 * Note: this will also compare the glTextures of texOne and texTwo via compareGLTextureToClone. 
 * 
 * @param texOne 
 * @param texTwo 
 * @returns 
 */
export function compareTextureToClone(texOne:Texture, texTwo:Texture):void {
    expect(texOne.name).to.equal(texTwo.name); 
    expect(texOne.filteringMin).to.equal(texTwo.filteringMin); 
    expect(texOne.filteringMag).to.equal(texTwo.filteringMag); 
    expect(texOne.is3D).to.equal(texTwo.is3D); 
    expect(texOne.url).to.equal(texTwo.url); 
    expect(texOne.useMipmapping).to.equal(texTwo.useMipmapping); 
    
    compareGLTextureToClone(texOne.glTexture, texTwo.glTexture); 

    expect(texOne.wrapS).to.equal(texTwo.wrapS); 
    expect(texOne.wrapT).to.equal(texTwo.wrapT); 

    if(texOne.is3D) {
        expect(texOne.wrapR).to.equal(texTwo.wrapR); 
    }

    if(texOne.useMipmapping) {
        expect(texOne.mipmapOption).to.equal(texTwo.mipmapOption);
        expect(texOne.width).to.equal(texTwo.width);
        expect(texOne.height).to.equal(texTwo.height);
    }
}


export function compareMaterialToClone(matOne:Material, matTwo:Material):void {
    expect(matOne.name).to.equal(matTwo.name); 
    compareStringSets(matOne.requirements, matTwo.requirements); 
    expect(matOne.isTransparent).to.equal(matTwo.isTransparent); 

    // this just blows up if one is missing
    if(matOne.texture || matTwo.texture) {
        compareTextureToClone(matOne.texture, matTwo.texture); 
    }

    if(matOne.color || matTwo.color) {
        compareObjectsJSON(matOne.color, matTwo.color); 
    }
}

