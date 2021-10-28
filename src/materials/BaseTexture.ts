import { v4 as uuidv4 } from 'uuid';

import { TextureFiltering, TextureMipmapFiltering, TextureType, TextureWrapping } from "../constants/constants"
import { GLTexture } from "./GLTexture";
import { IBaseTexture2 } from './IBaseTexture';

/**
 * @author SurgeExperiments
 * 
 * This class stores params for how to use a texture with WebGL (like wrapping and filtering options). 
 * Specific data about the texture source are stored in the GLTexture-instance in _glTexture. 
 * 
 * The GL-values that mirrors the enums in this class are almost never used after the initial setup of 
 * the texture with WebGL. Therefore they are not stored here. 
 * 
 * NOTE: For now most fields are kept public. If needed later clean this up and restrict access. 
 *       (If sharing references to instances becomes a problem, even if there is no need to modify any data here after init when it static?). 
 * 
 */
export class BaseTexture implements IBaseTexture2 {
    
    /* TODO: for now used to store */
    public name:string; 
    public uuid:string; 
    
    protected _classifier:string; 

    /* Optional: store the url to the texture element (HTMLImage ect). Will be serialized if it exist. */
    private _url:string|null; 
    protected _glTexture:GLTexture; 
    
    protected _target:TextureType; 

    public filteringMin:TextureFiltering; 
    public filteringMag:TextureFiltering; 
    
    protected _is3D=false;  
    public wrapS:TextureWrapping = TextureWrapping.CLAMP_EDGE;  
    public wrapT:TextureWrapping = TextureWrapping.CLAMP_EDGE;  
    public wrapR:TextureWrapping = TextureWrapping.CLAMP_EDGE;  
    
    private _useMipmapping=false; 
    public mipmapOption:TextureMipmapFiltering; 
    
    /* Required to set mipmapping */
    public width:number;
    public height:number;
    
    /* Set to true when the texture params are set up with WebGL */
    public isInitialized=false; 
    
    /**
     * @param glTexture this is not required to have a WebGLTexture or the GL-values set (as this would prevent simple loading from JSON). 
     * @param filteringMin 
     * @param filteringMag 
     * @param is3D true for TextureType.TEXTURE_3D
     */
    constructor(name:string, glTexture:GLTexture, target:TextureType, filteringMin:TextureFiltering, filteringMag:TextureFiltering, is3D:boolean, uuid?:string) {
        this.name = name; 

        if(!uuid) {
            this.uuid = uuidv4(); 
        } else {
            this.uuid = uuid;
        }

        this._glTexture = glTexture; 
        this._target = target; 
        this.filteringMin = filteringMin; 
        this.filteringMag = filteringMag; 
        this._is3D = is3D;
    }
    

    /**
     * Set other wrapping methods than the standard values. 
     * @param wrapS 
     * @param wrapT 
     * @param wrapR Only used if this is a 3D texture. 
     */
    public setWrappingOptions(wrapS: TextureWrapping, wrapT: TextureWrapping, wrapR:TextureWrapping=TextureWrapping.CLAMP_EDGE):void {
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        
        if(this.is3D) {
            this.wrapR = wrapR; 
        }
    }
    
    
    /**
     * Mipmapping is not used by default. Use this function to activate it.  
     * If you are using WebGL1, mipmapping will only be used if both width and height r powers of 2. 
     * 
     * @param mipmapFiltering 
     * @param width 
     * @param height 
     */
    public setMipMapOptions(mipmapFiltering:TextureMipmapFiltering, width:number, height:number):void {
        this._useMipmapping = true; 
        this.mipmapOption = mipmapFiltering; 
        this.width = width; 
        this.height = height; 
    }
    
    public get classifier():string {
        return this._classifier; 
    }

    public get glFramebufferAttachmentPoint():number {
        return this._glTexture.glFramebufferAttachmentPoint; 
    }

    public get is3D():boolean {
        return this._is3D; 
    }

    public get url():string {
        if(!this._url) {
            return ""; 
        } 

        return this._url; 
    }

    public set url(url: string|null) {
        this._url = url; 
    }
    
    public get target():TextureType {
        return this._target; 
    }

    public get useMipmapping():boolean {
        return this._useMipmapping; 
    }
    
    public get webGLTexture():WebGLTexture {
        return this._glTexture.texture; 
    }

    public get glTexture():GLTexture {
        return this._glTexture; 
    }
    
    public get glTextureInitialized():boolean {
        return this._glTexture.fullyInitialized; 
    }

    // TODO: remove? Really needed?  
    public get isThisAndGLTexInitialized():boolean {
        return this._glTexture.fullyInitialized && this.isInitialized; 
    }
    
    public get glTarget():number {
        return this._glTexture.glTarget; 
    }
    
    
    public jsonify():string {

        const proto:Record<string, unknown> = {}; 

        proto.name = this.name; 
        proto.uuid = this.uuid; 

        if(this._url) {
            proto.url = this._url; 
        }
        
        proto.glTexture = this._glTexture.jsonify(); 
        proto.filteringMin = this.filteringMin; 
        proto.filteringMag = this.filteringMag;

        proto.is3D = this.is3D; 
        proto.wrapS = this.wrapS;
        proto.wrapT = this.wrapT; 
        if(this.is3D) {
            proto.wrapR = this.wrapR; 
        }

        if(this._useMipmapping) {
            proto.useMipMapping = true; 
            proto.mipmapOption = this.mipmapOption; 
            proto.width = this.width; 
            proto.height = this.height; 
        }

        return JSON.stringify(proto); 
    }


    /**
     * After this you just need to create a tex via _webGLLayer.initGLTexture(glTexture, dataSource),
     * set it via webGlTexture(texture:WebGLTexture), and then do a GL_mirror via the engine. 
     * 
     * 
     * @param json 
     */
    public setFromJSON(json:string):void {
        const settings = JSON.parse(json); 
        const glTexSettings = JSON.parse(settings.glTexture); 
        
        const glTexture = new GLTexture(glTexSettings.level, glTexSettings.internalFormat, glTexSettings.format, 
                                        glTexSettings.type, glTexSettings.target, glTexSettings.flipYAxis, glTexSettings.hasData); 
        
        this.name = settings.name; 
        this.uuid = settings.uuid; 

        this._glTexture = glTexture; 

        this.filteringMin = settings.filteringMin; 
        this.filteringMag = settings.filteringMag; 

        this._is3D = settings.is3D; 

        if(settings.url) {
            this.url = settings.url; 
        } else {
            this.url = null; 
        }
        
        if(settings.is3D) {
            this.setWrappingOptions(settings.wrapS, settings.wrapT, settings.wrapR); 
        } else {
            this.setWrappingOptions(settings.wrapS, settings.wrapT); 
        }
        
        if(settings.useMipMapping) {
            this.setMipMapOptions(settings.mipmapOption, settings.width, settings.height); 
        }
    }
}
