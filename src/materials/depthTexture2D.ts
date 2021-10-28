import { FramebufferTextureAttachmentPoint, TextureDataType, TextureFiltering, TexturePixelFormat, TextureType, TextureWrapping } from "../constants/constants";
import { GLTexture } from "./GLTexture";
import { BaseTexture } from './BaseTexture';
import { staticImplements, SerializeCreate } from "../interfaces/serialize";


@staticImplements<SerializeCreate>() 
export class DepthTexture2D extends BaseTexture {
    
    /**
     * @param glTexture this is not required to have a WebGLTexture or the GL-values set (as this would prevent simple loading from JSON). 
     * @param filteringMin 
     * @param filteringMag 
     * @param is3D true for TextureType.TEXTURE_3D
     */
    constructor(name:string, width:number, height: number, uuid?:string) {
        const glTex = new GLTexture(0, TexturePixelFormat.DEPTH_COMPONENT, TexturePixelFormat.DEPTH_COMPONENT, TextureDataType.UNSIGNED_INT, TextureType.TEXTURE_2D, true, false); 
        glTex.width = width; 
        glTex.height = height; 
        
        super(name, 
                glTex, 
                TextureType.TEXTURE_2D, 
                TextureFiltering.NEAREST, 
                TextureFiltering.NEAREST, 
                false, 
                uuid); 
        
        this._glTexture.framebufferAttachmentPoint = FramebufferTextureAttachmentPoint.DEPTH_ATTACHMENT; 
        this.setWrappingOptions(TextureWrapping.CLAMP_EDGE, TextureWrapping.CLAMP_EDGE); 
        
        this.width = width; 
        this.height = height; 

        this._classifier = "depthTexture2D"; 
    }   
    
    
    public static createFromJSON(json:string):DepthTexture2D {
        const settings = JSON.parse(json); 
        const texture = new DepthTexture2D(settings.name, settings.width, settings.height, settings.uuid); 

        return texture; 
    }
}