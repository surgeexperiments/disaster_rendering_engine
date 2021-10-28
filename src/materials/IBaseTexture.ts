import { TextureFiltering, TextureWrapping, TextureMipmapFiltering, TextureType } from "../constants/constants";
import { GLTexture } from "./GLTexture";


// TODO: rename 
export interface IBaseTexture2 {
    
    /* TODO: for now used to store */
    name:string; 
    uuid:string; 
    
    classifier:string; 

    /* Optional: store the url to the texture element (HTMLImage ect). Will be serialized if it exist. */
    url:string|null; 
    glTexture:GLTexture; 
    webGLTexture:WebGLTexture; 

    target:TextureType; 
    filteringMin:TextureFiltering; 
    filteringMag:TextureFiltering; 
    
    is3D:boolean;  
    wrapS:TextureWrapping;  
    wrapT:TextureWrapping; 
    wrapR:TextureWrapping;   
    
    useMipmapping:boolean; 
    mipmapOption:TextureMipmapFiltering; 
    
    /* Required to set mipmapping */
    width:number;
    height:number;
    
    /* Set to true when the texture params are set up with WebGL */
    isInitialized:boolean; 

    glTextureInitialized:boolean
    glTarget:number
    
    // TODO: messy to have this here. Last minute hack! 
    glFramebufferAttachmentPoint:number; 
    /**
     * Set other wrapping methods than the standard values. 
     * @param wrapS 
     * @param wrapT 
     * @param wrapR Only used if this is a 3D texture. 
     */
    setWrappingOptions(wrapS: TextureWrapping, wrapT: TextureWrapping, wrapR:TextureWrapping):void; 
    
    /**
     * Mipmapping is not used by default. Use this function to activate it.  
     * If you are using WebGL1, mipmapping will only be used if both width and height r powers of 2. 
     * 
     * @param mipmapFiltering 
     * @param width 
     * @param height 
     */
    setMipMapOptions(mipmapFiltering:TextureMipmapFiltering, width:number, height:number):void; 
    jsonify():string; 
    setFromJSON(json:string):void; 
}