import { expect } from 'chai'; 
import { TextureDataType, TextureFiltering, TextureMipmapFiltering, TexturePixelFormat, TextureType,  TextureWrapping } from "../../src/constants/constants"
import { GLTexture } from "../../src/materials/GLTexture";
import { Texture } from "../../src/materials/texture"
import { compareTextureToClone } from "./comparisonFunctions"
import { getGLTextureAndInitParams, getTextureAndInitParams } from './util';

/**
 * Note: could have split the tests for setWrappingOptions() and json to/from 
 * into separate tests for 2D and 3D. For now it just seems messy. 
 */
describe('Texture tests', () => {

    const glTexture = getGLTextureAndInitParams(0, TexturePixelFormat.RGBA, TexturePixelFormat.RGBA, TextureDataType.FLOAT, 
                                                    TextureType.TEXTURE_2D, true).instance as GLTexture;

    const tex2DTestData = getTextureAndInitParams("TestTexture2DName", glTexture, TextureFiltering.BI_LINEAR, 
                                                  TextureFiltering.NEAREST, false, "testTextureUUID"); 

    const texture2D = tex2DTestData.instance as Texture; 
    const tex2DParams = tex2DTestData.params; 

    /* UUID is not set here so we can check that it is auto-generated */
    const texture3D = getTextureAndInitParams("TestTexture3DName", glTexture, TextureFiltering.BI_LINEAR, 
                                                  TextureFiltering.NEAREST, true).instance as Texture;

    const url = "https://www.test.com"; 
    
    
    it('default options', () => {
        expect(texture2D.name).to.equal(tex2DParams.name); 
        expect(texture2D.uuid).to.equal(tex2DParams.uuid); 
        expect(texture2D.glTexture).to.equal(glTexture); 
        expect(texture2D.filteringMin).to.equal(tex2DParams.filteringMin); 
        expect(texture2D.filteringMag).to.equal(tex2DParams.filteringMag); 
        expect(texture2D.is3D).to.equal(tex2DParams.is3D); 
        
        expect(texture2D.url).to.equal(""); 

    }); 
    
    it('default options: verify that when the uuid param is not given it is automatically set', () => {
        expect(texture3D.uuid).to.not.undefined;   
        expect(texture3D.uuid.length).to.be.above(0); 
    }); 

    it('url', () => {
        texture2D.url = url; 
        expect(texture2D.url).to.equal(url); 
    }); 

    /* After this test glTexture.textureSet will be true */
    it('setMipMapOptions()', () => {
        // Somewhat overkill? 
        expect(texture2D.mipmapOption).to.be.undefined;
        expect(texture2D.width).to.be.undefined;
        expect(texture2D.height).to.be.undefined;
        expect(texture2D.useMipmapping).to.equal(false); 

        const mipmapOption:TextureMipmapFiltering = TextureMipmapFiltering.LINEAR_MIPMAP_LINEAR; 
        const width=1000;
        const height=2000; 
        texture2D.setMipMapOptions(mipmapOption, width, height); 

        expect(texture2D.useMipmapping).to.equal(true); 
        expect(texture2D.mipmapOption).to.equal(mipmapOption); 
        expect(texture2D.height).to.equal(height); 
        expect(texture2D.width).to.equal(width); 
    }); 


    it('setWrappingOptions() for 2D and 3D', () => {
        expect(texture2D.wrapS).to.equal(TextureWrapping.CLAMP_EDGE);
        expect(texture2D.wrapT).to.equal(TextureWrapping.CLAMP_EDGE);
        expect(texture2D.wrapR).to.equal(TextureWrapping.CLAMP_EDGE);

        const wrapS:TextureWrapping = TextureWrapping.MIRRORERD_REPEAT; 
        const wrapT:TextureWrapping = TextureWrapping.MIRRORERD_REPEAT; 
        const wrapR:TextureWrapping = TextureWrapping.REPEAT; 

        texture2D.setWrappingOptions(wrapS, wrapT);

        expect(texture2D.wrapS).to.equal(wrapS);
        expect(texture2D.wrapT).to.equal(wrapT);
        
        texture3D.setWrappingOptions(wrapS, wrapT, wrapR); 

        expect(texture3D.wrapS).to.equal(wrapS);
        expect(texture3D.wrapT).to.equal(wrapT);
        expect(texture3D.wrapR).to.equal(wrapR);
    }); 
    
    
    it('isThisAndGLTexInitialized()', () => {
        expect(texture2D.isInitialized).to.equal(false); 
        expect(texture2D.isThisAndGLTexInitialized).to.equal(false); 

        /* Need to force the glTexture to be fully initialized */
        const _glTexture = texture2D.glTexture; 
        const tex = 1 as WebGLTexture; 
        _glTexture.texture = tex;
        _glTexture.setGLValues(1, 2, 3, 4); 

        expect(texture2D.glTextureInitialized).to.equal(true); 
        expect(texture2D.isInitialized).to.equal(false); 
        expect(texture2D.isThisAndGLTexInitialized).to.equal(false); 

        texture2D.isInitialized = true; 
        
        expect(texture2D.isThisAndGLTexInitialized).to.equal(true); 
    });
    
    it('json to/from 2D/3D', () => {
        let json = texture2D.jsonify(); 
        const texture2DClone = Texture.createFromJSON(json); 
        
        compareTextureToClone(texture2D, texture2DClone); 

        json = texture3D.jsonify(); 
        const texture3DClone = Texture.createFromJSON(json); 

        compareTextureToClone(texture3D, texture3DClone); 
    }); 
}); 