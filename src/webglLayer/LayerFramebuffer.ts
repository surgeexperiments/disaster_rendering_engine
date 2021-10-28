import { WebGLRenderingContext } from "../d.ts/WebGLContext";
import { IBaseTexture2 } from "../materials/IBaseTexture";

import { Framebuffer } from "./framebuffer";


/**
 * Framebuffer helper class. Allows you to set up applications of multiple shader effects in a row, where
 * each shader uses the output texture of the previous effect pass as input. 
 * 
 * @author SurgeExperiments
 * 
 * Based on a terrific tutorial found here: https://webglfundamentals.org/webgl/lessons/webgl-image-processing-continued.html
 * 
 * TODO: 
 * - Fix the Texture class, it's needed for initPingPongEffects
 */
 export class LayerFramebuffer {
    private _gl:WebGLRenderingContext;
    private _textures:WebGLTexture[]; 
    private _framebuffers: Framebuffer[];

    private _currFramebuffer = 0; 
    
    /* Multiple functions will refer to the settings for the internal render textures. */
    private _renderTexTarget:number; 
    private _renderTexLevel:number; 
    private _renderTexInternalFormat:number; 
    private _renderTexBorder:number; 
    private _renderTexFormat:number; 
    private _renderTexType:number; 

    constructor(gl:WebGLRenderingContext) {
        this._gl = gl;
        this._textures = []; 
        this._framebuffers = []; 

        this._setInternalConfiguration(); 
    }
    
    private _setInternalConfiguration():void {
        const gl = this._gl; 
        this._renderTexTarget = gl.TEXTURE_2D; 
        this._renderTexLevel = 0;
        this._renderTexInternalFormat = gl.RGBA; 

        /* Must be 0 to use glTexture2D() */
        this._renderTexBorder = 0;
        this._renderTexFormat = gl.RGBA; 
        this._renderTexType = gl.UNSIGNED_BYTE; 
    }

    public checkFramebuffer():void {
        const gl:WebGLRenderingContext = this._gl; 
        const retVal:number = gl.checkFramebufferStatus(gl.FRAMEBUFFER); 
        
        if(retVal  == gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT) {
            console.log(retVal);
        } else if (retVal ==  gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS) {
            console.log(retVal);
        } else if (retVal ==  gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT) {
            console.log(retVal);
        } else if (retVal ==  gl.FRAMEBUFFER_UNSUPPORTED) {
            console.log(retVal);
        } else {
            //console.log(retVal);
        }
    }
    
    /**
     * @brief call setupPingPongPipeline() before running this! 
     * @param {*} width 
     * @param {*} height 
     */
     public initPingPongPass(width:number, height:number):void {
        this._currFramebuffer = 0; 
        this.setFramebuffer(this._framebuffers[this._currFramebuffer].framebuffer, width, height); 
    }
    
    /**
     * @brief This function will make the texture we just rendered to as the active one
     *        NOTE: Don't bind any textures after using this function. 
     */
     public getNextPingPongFramebuffer(width:number, height:number):void {
        ++this._currFramebuffer; 
        this.setFramebuffer(this._framebuffers[this._currFramebuffer % 2].framebuffer, width, height);
    }
    
    public setPingPongToCanvasRendering(width:number, height:number):void {
        this.setFramebuffer(null, width, height);
    }
    
    /**
     * @brief If you need to bind the texture rendered to in the current rendering pass to a texture unit, use this
     */
     public bindCurrentTextureRenderingTarget(textureUnit:number):void {
        this._gl.activeTexture(this._gl.TEXTURE0 + textureUnit);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._textures[this._currFramebuffer % 2]); 
    }  
    
    /**
     * @brief If you need to bind the texture rendered to in the previous rendering pass to a texture unit, use this
     *        NOTE: ONLY call if you've done at least one rendering pass 
     */
     public bindTexturePreviouslyRenderedTo(textureUnit:number):void {
        if(this._currFramebuffer == 0) {
            throw("FramebufferHelper: bindTexturePreviouslyRenderedTo() called before a second rendering pass was initiated!"); 
        }

        this._gl.activeTexture(this._gl.TEXTURE0 + textureUnit);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._textures[(this._currFramebuffer - 1) % 2]);
    }
    
    public setFramebuffer(fbo:WebGLFramebuffer|null, width:number, height:number):void {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, fbo);
        
        // Tell WebGL how to convert from clip space to pixels
        this._gl.viewport(0, 0, width, height);
        this.checkFramebuffer(); 
    } 
    

    /*
     * Setup two framebuffers that you can use to apply effect after effect by "ping ponging" back and fourth between the two buffers
     * Use this.framebufferHelper.setPingPongToCanvasRendering(); after this if you want to render to the canvas. 
     */
    public setupPingPongPipeline(width:number, height:number):void {

        const gl:WebGLRenderingContext = this._gl; 
        
        for(let i=0; i<2; ++i) {

            const texture:WebGLTexture = this.createAndBindTexNobuf2D(); 
            this._textures.push(texture); 
                
            gl.texImage2D(this._renderTexTarget, this._renderTexLevel, this._renderTexInternalFormat, width, height, 
                          this._renderTexBorder, this._renderTexFormat, this._renderTexType, null);
            
            /* Create a framebuffer and keep it bound */
            const fbo = this.createFrameBuffer(width, height, true, false); 
            this._framebuffers.push(fbo); 
            
            /* TODO: level is set to 0. Parameterize? */
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        } 

        this.setPingPongToCanvasRendering(width, height);
    }


    /**
     * TODO: allow to set different color attachments 
     * @param width For canvas width: call with gl.canvas.width
     * @param height For canvas height: call with gl.canvas.height 
     * @returns a Framebuffer object
     */
     public createFrameBuffer(width:number, height:number, createRenderBuffer:boolean, unbindCreatedFramebuffer:boolean, internalFormat?:number):Framebuffer {
        const gl:WebGLRenderingContext = this._gl; 

        const fb:Framebuffer = new Framebuffer(width, height, (internalFormat)?internalFormat:gl.DEPTH_COMPONENT16); 
        fb.framebuffer = gl.createFramebuffer(); 
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb.framebuffer); 
        
        if(createRenderBuffer) {
            fb.renderbuffer = gl.createRenderbuffer(); 

            gl.bindRenderbuffer(gl.RENDERBUFFER, fb.renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, fb.internalFormat, fb.width, fb.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, fb.renderbuffer); 
        }

        if(unbindCreatedFramebuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        
        return fb; 
    }


    /* */
    public attachRenderTextureToFrameBuffer(texture:IBaseTexture2, fb:Framebuffer, unbindFramebuffer?:boolean):void {
        const gl:WebGLRenderingContext = this._gl; 

        gl.bindTexture(texture.glTarget, texture.webGLTexture);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb.framebuffer); 

        /* TODO: have a system for colorAttachment? */
        //gl.framebufferTexture2D(
        //    gl.FRAMEBUFFER, fb.colorAttachment, texture.glTarget, texture.webGLTexture, 0);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, texture.glFramebufferAttachmentPoint, texture.glTarget, texture.webGLTexture, 0);

        if(unbindFramebuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb.framebuffer); 
        } 
    }
    

    /**
     * Call whenever the canvas has been resized 
     * @param width 
     * @param height 
     */
    public resizePingPongPipeline(width:number, height:number):void {
        /* Number of internal textures and framebuffers are the same. If this isn't the case this should crash :D */
        for(let i=0; i<this._framebuffers.length; ++i) {
            this.resizeFramebuffer(this._framebuffers[i], width, height); 
            this._resizeInternalRenderTexture(this._textures[i], width, height); 
        }
    }   
    

    private _resizeInternalRenderTexture(texture:WebGLTexture, width:number, height:number) {
        const gl = this._gl; 
        gl.bindTexture(this._renderTexTarget, texture);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(this._renderTexTarget, this._renderTexLevel, this._renderTexInternalFormat, width, height, 
                      this._renderTexBorder, this._renderTexFormat, this._renderTexType, null);
        gl.bindTexture(this._renderTexTarget, null);
    }

    public resizeFramebuffer(fb:Framebuffer, width:number, height:number):void {
        if(fb.renderbuffer) {
            const gl:WebGLRenderingContext = this._gl; 
            gl.bindRenderbuffer(gl.RENDERBUFFER, fb.renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, fb.internalFormat, width, height);

            // AAHrg, typescript! lol! 
            gl.bindRenderbuffer(gl.RENDERBUFFER, (null as unknown) as WebGLRenderbuffer);
        }  
    }

    /**
     * Don't want to involve LayerTexture for this highly specialized stuff. 
     */
     createAndBindTexNobuf2D(): WebGLTexture  {
        
        const gl = this._gl; 
        const texture:WebGLTexture = gl.createTexture() as WebGLTexture; 

        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
        return texture; 
    }
}




