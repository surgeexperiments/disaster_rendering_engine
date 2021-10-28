import { expect } from 'chai'; 
import { GLTexture } from "../../src/materials/GLTexture";
import { TexturePixelFormat, TextureDataType, target} from "../../src/constants/constants"

import { getGLTextureAndInitParams } from './util';
import { compareGLTextureToClone } from "./comparisonFunctions"


describe('GLTexture tests', () => {
    const testData = getGLTextureAndInitParams(0, TexturePixelFormat.RGBA, TexturePixelFormat.RGBA, 
                                                            TextureDataType.FLOAT, target.TEXTURE_2D, true); 

    const glTexture:GLTexture = testData.instance as GLTexture; 
    const params = testData.params; 
    
    
    it('default options', () => {
        expect(glTexture.level).to.equal(params.level); 
        expect(glTexture.internalFormat).to.equal(params.internalFormat); 
        expect(glTexture.format).to.equal(params.format); 
        expect(glTexture.type).to.equal(params.type); 
        expect(glTexture.target).to.equal(params.target); 
        expect(glTexture.flipYAxis).to.equal(params.flipYAxis); 
    }); 
    
    /* After this test glTexture.textureSet will be true */
    it('set texture()', () => {
        expect(glTexture.textureSet).to.equal(false); 
        // TODO: use output from createTexture()? 
        const tex = 1 as WebGLTexture; 
        glTexture.texture = tex; 
        expect(glTexture.textureSet).to.equal(true); 
        expect(glTexture.texture).to.equal(tex); 
        expect(glTexture.fullyInitialized).to.equal(false); 
    }); 

    /* After this test .textureSet, .glMirrored and .fullyInitialized will be true */
    it('setGLValues()', () => {
        /* Force gl.textureSet to be true regardless of what has happened previously */
        const tex = 1 as WebGLTexture; 
        glTexture. texture = tex;
        
        expect(glTexture.glMirrored).to.equal(false); 
        glTexture.setGLValues(1, 2, 3, 4); 
        expect(glTexture.glMirrored).to.equal(true); 
        expect(glTexture.glInternalFormat).to.equal(1); 
        expect(glTexture.glFormat).to.equal(2);
        expect(glTexture.glType).to.equal(3);
        expect(glTexture.glTarget).to.equal(4);
        expect(glTexture.fullyInitialized).to.equal(true); 
    }); 

    
    it('json to/from', () => {
        const json = glTexture.jsonify(); 
        const glTextureClone = GLTexture.createFromJSON(json); 

        expect(glTextureClone.fullyInitialized).to.equal(false); 
        
        compareGLTextureToClone(glTexture, glTextureClone); 
    }); 
}); 