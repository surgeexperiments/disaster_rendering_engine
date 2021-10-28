import { WebGLRenderingContext } from "../d.ts/WebGLContext";
import { TextureFiltering, TextureMipmapFiltering, TextureWrapping} from "../constants/constants"
import { GLTexture } from "../materials/GLTexture";
import { ConstantsConverter } from "./constantsConverter";
import { IBaseTexture2 } from "../materials/IBaseTexture";


/**
 * @author SurgeExperiments
 * 
 * How to set up a texture: 
 * 1: Load a texture source element (array, HTMLImage, HTMLvideo ect) and a corresponding GLTexture instance with the settings you want. 
 * 2: call initGLTexture(). This will create a texture from the data source in video memory. 
 * 3: Create a Texture instance loaded with the GLTexture you just created and the settings you want. 
 * 4: call initTextureParams() with the Texture instance. This sets up things like Wrapping and Filtering. 
 * 
 * If you have a video texture: 
 * - Call updateTexture() when you want to update your texture. This is only needed if the texture is in view lol. 
 */
 export class LayerTexture {

    private _gl: WebGLRenderingContext; 
    private _constantsConverter:ConstantsConverter; 

    constructor(gl: WebGLRenderingContext) {
        this._gl = gl; 
        this._constantsConverter = new ConstantsConverter(gl); 
    }
    
    public createTextureAndBind(glTarget:number): WebGLTexture {
        const texture:WebGLTexture = this._gl.createTexture() as WebGLTexture; 
        this._gl.bindTexture(glTarget, texture);
        
        return texture; 
    }
    
    /** 
     * Will initialize an image and return the texture and supplied settings in a GLTexture instance
     * @param sourceElement An element that matches the settings in the glTexture parameter
     * @param glTexture an instance with the settings you want already set 
     * @exceptions the constantsConverter will throw exceptions for unknown constants 
     */
     public initGLTexture(glTexture:GLTexture, sourceElement?:HTMLImageElement):void {
        
        this._setGLValues(glTexture);  

        glTexture.texture = this.createTextureAndBind(glTexture.glTarget);
        
        this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, glTexture.flipYAxis ? 1:0); 
        
        this.resizeGLTexture(glTexture, glTexture.width, glTexture.height, false, sourceElement); 
    }
    
    private _setGLValues(glTexture:GLTexture):void {    
        /* This creates the GL-values that mirrors the internal constants so we don't have to look them up again and again */
        glTexture.setGLValues(this._constantsConverter.texturePixelFormatToGL(glTexture.internalFormat), 
                            this._constantsConverter.texturePixelFormatToGL(glTexture.format), 
                            this._constantsConverter.textureDataTypeToGL(glTexture.type), 
                            this._constantsConverter.textureTypeToGL(glTexture.target),
                            this._constantsConverter.framebufferTextureAttachmentPointToGL(glTexture.framebufferAttachmentPoint));
    }

    /**
     * Set things like mipmapping and filtering on a texture that has been loaded via initGlTextureFromImage()
     * TODO: RENAME! 
     * TODO: This is tuned for WebGL1 where mipmapping is only allowed for textures with powers of 2. Add in a check for WebGL2. 
     * TODO2: This is only for texture2D right now. 
     * @param texture Texture2D instance loaded with the settings we want.
     */
    initTextureParams(texture:IBaseTexture2):void {
        this._gl.bindTexture(texture.glTarget, texture.webGLTexture); 

        // TODO: Force texture.width/height to be set first § if(isWebGL2 || (pow2))
        if(texture.useMipmapping && (this._isPowerOf2(texture.width) && this._isPowerOf2(texture.height))) {
            this.generateMipmap(texture.glTarget); 
            this.setTextureMipmapFiltering(texture.glTarget, texture.mipmapOption); 
        }

        this.setTextureFiltering(texture.glTarget, texture.filteringMin, texture.filteringMag); 
        
        /* TODO: check that this works with undefined */
        this.setTextureWrapping(texture.glTarget, texture.wrapS, texture.wrapT, texture.wrapR);
    }

    generateMipmap(glTarget:number):void {
        this._gl.generateMipmap(glTarget);
    }

    setTextureMipmapFiltering(glTarget:number, mipmapFiltering:TextureMipmapFiltering):void {
        const glMipmapFiltering:number = this._constantsConverter.textureMipmapFilteringToGL(mipmapFiltering); 

        /* Since mipmapping is primarely used for textures that gets downscaled, setting TEXTURE_MAG_FILTER will have no effect. */
        this._gl.texParameteri(glTarget, this._gl.TEXTURE_MIN_FILTER, glMipmapFiltering);
    }

    /**
     * 
     * @param glTarget 
     * @param filteringMin 
     * @param filteringMag 
     */
    setTextureFiltering(glTarget:number, filteringMin:TextureFiltering, filteringMag:TextureFiltering):void {
        const glFilteringMin = this._constantsConverter.textureFilteringToGL(filteringMin); 
        const glFilteringMag = this._constantsConverter.textureFilteringToGL(filteringMag); 

        this._gl.texParameteri(glTarget, this._gl.TEXTURE_MIN_FILTER, glFilteringMin); 
        this._gl.texParameteri(glTarget, this._gl.TEXTURE_MAG_FILTER, glFilteringMag); 
    }
    
    // TODO: replace the null checks with ?
    setTextureWrapping(glTarget:number, wrapS:TextureWrapping, wrapT:TextureWrapping|null=null, wrapR:TextureWrapping|null=null):void {
        const glWrapS:number = this._constantsConverter.textureWrappingToGL(wrapS); 

        this._gl.texParameteri(glTarget, this._gl.TEXTURE_WRAP_S, glWrapS);

        if(wrapT) {
            const glWrapT:number = this._constantsConverter.textureWrappingToGL(wrapT);
            this._gl.texParameteri(glTarget, this._gl.TEXTURE_WRAP_T, glWrapT);
        }
        
        if(wrapR) {
            const glWrapR:number = this._constantsConverter.textureWrappingToGL(wrapR);
            this._gl.texParameteri(glTarget, this._gl.TEXTURE_WRAP_T, glWrapR);
        }
    }

    
    private _isPowerOf2(value:number) {
        return (value & (value - 1)) == 0;
    }

    /**
     * NOTE: try to avoid using this method. Use the ImageLoader() from resource manager instead and do a proper pre-load of a scene. 
     *       This method is for a one-off image or something, not suited when loading many imgs for a big scene. 
     * @param gl 
     * @param level 
     * @param internalFormat 
     * @param srcFormat 
     * @param srcType 
     * @param pixel 
     * @returns 
     */
    createOnePixelTex2D(gl:WebGLRenderingContext, level:number, internalFormat:number, srcFormat:number, srcType:number, pixel: Uint8Array): WebGLTexture {
        const texture:WebGLTexture = this.createTextureAndBind(gl.TEXTURE_2D);
        //this.texture = gl.createTexture(); 
        //gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single blue pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const width = 1;
        const height = 1;
        const border = 0;
        
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      width, height, border, srcFormat, srcType, pixel);
        
        return texture; 
    }
    
    resizeTexture(texture:IBaseTexture2, width:number, height:number, sourceElement?:HTMLImageElement):void {
        this.resizeGLTexture(texture.glTexture, width, height, true, sourceElement); 
    }

    resizeGLTexture(glTexture:GLTexture, width:number, height:number, bindAndUnbindTexture:boolean, sourceElement?:HTMLImageElement):void {
        const gl = this._gl; 

        glTexture.width = width; 
        glTexture.height = height; 

        if(bindAndUnbindTexture) {
            gl.bindTexture(glTexture.glTarget, glTexture.texture);
        }
        
        
        if(glTexture.hasData) {
            this._gl.texImage2D(glTexture.glTarget, glTexture.level, glTexture.glInternalFormat, glTexture.glFormat, glTexture.glType, sourceElement as HTMLImageElement);
        } else {
            this._gl.texImage2D(
                glTexture.glTarget, glTexture.level, glTexture.glInternalFormat, glTexture.width, glTexture.height, glTexture.border,
                glTexture.glFormat, glTexture.glType, null);
        }
        
        if(bindAndUnbindTexture) {
            gl.bindTexture(glTexture.glTarget, null);
        }
        
    }
    
    
    bindTexture(texture:IBaseTexture2, textureUnit:number):void {
        this._gl.activeTexture(this._gl.TEXTURE0 + textureUnit);
        this._gl.bindTexture(texture.glTarget, texture.webGLTexture); 
    }
    

    /**
     * TODO: video-texture prob needs the real gl-values! 
     * @brief use this when updating a texture from a video ect.
     * @param {*} video 
     */
     updateTexture(glTexture:GLTexture, video:HTMLVideoElement):void {
        this._gl.bindTexture(glTexture.glTarget, glTexture.texture); 
        this._gl.texImage2D(glTexture.glTarget, glTexture.level, glTexture.glInternalFormat, glTexture.glFormat, glTexture.glType, video);
     }
}



