import { TextureFiltering,  TextureType } from "../constants/constants"
import { BaseTexture } from './BaseTexture';
import { GLTexture } from "./GLTexture";
import { SerializeCreate, staticImplements } from '../interfaces/serialize';


/**
 * @author SurgeExperiments
 * 
 * This class stores params for how to use a texture with WebGL (like wrapping and filtering options). 
 * Specific data about the texture source are stored in the GLTexture-instance in _glTexture. 
 */
@staticImplements<SerializeCreate>() 
export class Texture2D extends BaseTexture {
    
    /**
     * @param glTexture this is not required to have a WebGLTexture or the GL-values set (as this would prevent simple loading from JSON). 
     * @param filteringMin 
     * @param filteringMag 
     * @param is3D true for TextureType.TEXTURE_3D
     */
    constructor(name:string, glTexture:GLTexture, filteringMin:TextureFiltering, filteringMag:TextureFiltering, uuid?:string) {
        super(name, glTexture, TextureType.TEXTURE_2D, filteringMin, filteringMag, false, uuid); 
        
        this._classifier = "texture2D"; 
    }
    
    
    /**
     * After this you just need to create a tex via _webGLLayer.initGLTexture(glTexture, dataSource),
     * set it via webGlTexture(texture:WebGLTexture), and then do a GL_mirror via the engine. 
     * 
     * 
     * @param json 
     */
    public static createFromJSON(json:string):Texture2D {
        const settings = JSON.parse(json); 
        const glTexSettings = JSON.parse(settings.glTexture); 
        
        const glTexture = new GLTexture(glTexSettings.level, glTexSettings.internalFormat, glTexSettings.format, 
                                        glTexSettings.type, glTexSettings.target, glTexSettings.flipYAxis, glTexSettings.hasData); 
        
        const texture = new Texture2D(settings.name, glTexture, settings.filteringMin, settings.filteringMag, settings.uuid);  

        if(settings.url) {
            texture.url = settings.url; 
        }
        
        if(settings.is3D) {
            texture.setWrappingOptions(settings.wrapS, settings.wrapT, settings.wrapR); 
        } else {
            texture.setWrappingOptions(settings.wrapS, settings.wrapT); 
        }
        
        if(settings.useMipMapping) {
            texture.setMipMapOptions(settings.mipmapOption, settings.width, settings.height); 
        }

        return texture; 
    }
}


