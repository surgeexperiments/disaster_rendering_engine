import { WebGLRenderingContext } from "../d.ts/WebGLContext";

import { LayerTexture } from "./LayerTexture";
import { GLTexture } from "../materials/GLTexture";
import { LayerBuffer } from "./LayerBuffer";
import { LayerCanvas } from "./LayerCanvas";
import { LayerShader } from "./LayerShader";
import { LayerFramebuffer } from "./LayerFramebuffer";

import {UniformList, AttribList, GLShader} from "../materials/GLShader";

import { contextLostCallback } from "./LayerCanvas"; 
import { WebGLCapabilities } from "./capabilities";
import { GLMesh } from "../mesh/GLMesh";
import { GLArrayBuffer } from "../mesh/GLBuffer";
import { Framebuffer } from "./framebuffer";
import { IMeshObject } from "../mesh/IMeshObject";
import { IBaseTexture2 } from "../materials/IBaseTexture";


export interface IWebGLLayer {
    attachRenderTextureToFrameBuffer(texture:IBaseTexture2, fb:Framebuffer, unbindFramebuffer?:boolean):void; 
    init():boolean; 
    bindArrayBufferToShaderAttrib(glArrBuf:GLArrayBuffer, shaderAttribRef:number):void; 
    bindTexturePreviouslyRenderedTo(textureUnit:number):void; 
    bindTexture(texture:IBaseTexture2, textureUnit:number):void; 

    // Remove two below 
    //bindRenderTexture(texture:IBaseTexture2, textureUnit:number):void;
    //bindTexture(glTexture:GLTexture, textureUnit:number):void; 
    bindVAO(vao:WebGLVertexArrayObjectOES):void; 
    canvasHeight():number; 
    canvasWidth():number; 
    canvasClientHeight():number; 
    canvasClientWidth():number; 

    clearCanvas(r:number, g:number, b:number, a:number):void; 
    clearCanvas3D(r:number, g:number, b:number, a:number):void;
    clearCanvasColor(r:number, g:number, b:number, a:number):void; 
    clearCanvasColorBuffer():void;
    clearCanvasDepthBuffer():void; 
    createFrameBuffer(width:number, height:number, createRenderBuffer:boolean, unbindCreatedFramebuffer:boolean, internalFormat?:number):Framebuffer; 

    createShader(vertexShader:string, fragmentShader:string): WebGLProgram; 
    disableAlphaBlend():void; 
    disableDepthTest():void; 
    disableDepthWriting():void; 
    enableDepthWriting():void
    draw(glMesh:GLMesh, bindElementBuffer?:boolean):void; 
    enableAlphaBlend():void; 
    enableDepthTest():void; 
    getNextPingPongFramebuffer(width:number, height:number):void; 

    /* Uses clientWidth and clientHeight */
    getCanvasAspect():number;

    /* Run this before starting a framebuffer ping-pong pass */
    initPingPongPass(width:number, height:number):void; 
    loadUniforms(shaderRef:WebGLShader, uniformList:UniformList):UniformList;
    loadAttribs(shaderRef:WebGLShader, attribList:AttribList):AttribList;
    setFramebuffer(fbo:WebGLFramebuffer|null, width:number, height:number):void; 
    setUniforms(uniformList:UniformList):void;
    setPingPongToCanvasRendering(width:number, height:number):void; 

    /* Set up framebuffers so that you can render a series of effects where each gets the output of the previous rendering operation as input */
    setupPingPongPipeline(width:number, height:number):void; 
    initGLTexture(glTexture:GLTexture, sourceElement?:HTMLImageElement):void; 
    initTextureParams(texture:IBaseTexture2):void 
    
    /**
     * Load a MeshObject with its buffers and a GLMesh that contains the GL-settings for those buffers. 
     * This function will then init the buffers on VRAM and store the WebGLBuffer-references in the GLBuffers stored in glMesh.  
     */
     glMirrorMeshObject(meshObject:IMeshObject):void; 

    /* If the canvas size changes, you must resize any framebuffer that contains a renderbuffer */
    resizeFramebuffer(fb:Framebuffer, width:number, height:number):void 

    resizePingPongPipeline(width:number, height:number):void; 

    resizeTexture(texture:IBaseTexture2, width:number, height:number, sourceElement?:HTMLImageElement):void; 
     /* Returns true if the canvas has been resized. Calling this will tell you if renderbuffers, render textures ect need to be resized */
     resizeCanvasToDisplaySize(multiplier?:number):boolean; 
     updateBuffer(buffer:ArrayBuffer, offset:number, glBuffer:GLArrayBuffer):void; 
     useShader(glShader:GLShader):void; 
}


export class WebGLLayer implements IWebGLLayer {
    private _gl:WebGLRenderingContext; 
    private canvasID:string; 
    private canvas:LayerCanvas; 
    private texture:LayerTexture; 
    private buffer:LayerBuffer; 
    private shader:LayerShader; 
    private _framebuffer:LayerFramebuffer; 
    private _capabilities:WebGLCapabilities; 

    //private framebufferHelper:FramebufferHelper; 
    
    constructor(canvasID:string) {
        this.canvasID = canvasID; 
    }
    
    attachRenderTextureToFrameBuffer(texture:IBaseTexture2, fb:Framebuffer, unbindFramebuffer?:boolean):void {
        this._framebuffer.attachRenderTextureToFrameBuffer(texture, fb, unbindFramebuffer); 
    }
    
    init():boolean {
        this.canvas = new LayerCanvas(this.canvasID); 
        // TODO: check for errors 
        if(this.canvas.loadAssets() != true) {
            return false; 
        }

        // TODO: Make onContextLostHandler an argument U can pass? Or have some message-system that other items can register for? 
        this.canvas.setOnContextLostHandler(this.onContextLostHandler.bind(this)); 
        this._gl = this.canvas.gl; 
        this.texture = new LayerTexture(this._gl); 
        
        this.shader = new LayerShader(this._gl); 
        this._framebuffer = new LayerFramebuffer(this._gl); 
        this._capabilities = new WebGLCapabilities(this._gl); 
        
        if(!this._capabilities.enableVAOExtension()) {
            alert("could not set up OES_vertex_array_object"); 
            return false; 
        }

        if(!this._capabilities.enableDepthTexture()) {
            alert("could not set up WEBGL_depth_texture"); 
            return false; 
        }
        
        this.buffer = new LayerBuffer(this._gl, this._capabilities.vao); 
        
        return true; 
    }
    
    // TODO: implement 
    public onContextLostHandler(err:string):void {
        alert("Canvas context lost!" + err); 
    }

    bindArrayBufferToShaderAttrib(glArrBuf:GLArrayBuffer, shaderAttribRef:number):void {
        this.buffer.bindArrayBufferToShaderAttrib(glArrBuf, shaderAttribRef); 
    }

    bindTexturePreviouslyRenderedTo(textureUnit:number):void {
        this._framebuffer.bindTexturePreviouslyRenderedTo(textureUnit); 
    }

    public bindTexture(texture:IBaseTexture2, textureUnit:number):void  {
        this.texture.bindTexture(texture, textureUnit); 
    }

    public bindVAO(vao:WebGLVertexArrayObjectOES):void {
        this.buffer.bindVAO(vao);
    }

    canvasHeight():number {
        return this.canvas.height; 
    }

    canvasWidth():number {
        return this.canvas.width; 
    }

    canvasClientHeight():number {
        return this.canvas.clientHeight; 
    }

    canvasClientWidth():number {
        return this.canvas.clientWidth; 
    }

    clearCanvas(r:number, g:number, b:number, a:number):void {
        this.canvas.clearCanvas(r,g,b,a); 
    }

    clearCanvas3D(r:number, g:number, b:number, a:number):void {
        this.canvas.clearCanvas3D(r,g,b,a); 
    }

    clearCanvasColor(r:number, g:number, b:number, a:number):void {
        this.canvas.clearCanvasColor(r,g,b,a); 
    }

    clearCanvasColorBuffer():void { 
        this.canvas.clearCanvasColorBuffer(); 
    }

    clearCanvasDepthBuffer():void {
        this.canvas.clearCanvasDepthBuffer(); 
    }

    createFrameBuffer(width:number, height:number, createRenderBuffer:boolean, unbindCreatedFramebuffer:boolean, internalFormat?:number):Framebuffer {
        return this._framebuffer.createFrameBuffer(width, height, createRenderBuffer, unbindCreatedFramebuffer, internalFormat); 
    }

    createShader(vertexShader:string, fragmentShader:string):WebGLProgram {
        return this.shader.createShader(vertexShader, fragmentShader) as WebGLProgram; 
    }
    
    disableAlphaBlend():void {
        this.canvas.disableAlphaBlend(); 
    }

    disableDepthTest():void {
        this.canvas.disableDepthTest(); 
    }

    disableDepthWriting():void {
        this.canvas.disableDepthWriting();  
    }

    draw(glMesh:GLMesh, bindElementBuffer?:boolean):void {
        this.buffer.draw(glMesh, bindElementBuffer); 
    }
    
    enableAlphaBlend():void {
        this.canvas.enableAlphaBlend(); 
    }

    enableDepthTest():void {
        this.canvas.enableDepthTest(); 
    }

    enableDepthWriting():void {
        this.canvas.enableDepthWriting(); 
    }

    getNextPingPongFramebuffer(width:number, height:number):void {
        this._framebuffer.getNextPingPongFramebuffer(width, height);
    }

    getCanvasAspect():number {
        return this.canvas.getCanvasAspect(); 
    }
    
    loadUniforms(shaderRef:WebGLShader, uniformList:UniformList):UniformList {
        return this.shader.loadUniforms(shaderRef, uniformList); 
    }
    
    loadAttribs(shaderRef:WebGLShader, attribList:AttribList):AttribList {
        return this.shader.loadAttribs(shaderRef, attribList); 
    }

    /* Set fbo == null to set canvas rendering */
    setFramebuffer(fbo:WebGLFramebuffer|null, width:number, height:number):void {
        this._framebuffer.setFramebuffer(fbo, width, height); 
    }

    setPingPongToCanvasRendering(width:number, height:number):void {
        this._framebuffer.setPingPongToCanvasRendering(width, height); 
    }

    setUniforms(uniformList:UniformList):void {
        this.shader.setUniforms(uniformList); 
    }

    setupPingPongPipeline(width:number, height:number):void {
        this._framebuffer.setupPingPongPipeline(width, height); 
    }

    initGLTexture(glTexture:GLTexture, sourceElement?:HTMLImageElement):void {
        this.texture.initGLTexture(glTexture, sourceElement); 
    }

    initPingPongPass(width:number, height:number):void {
        this._framebuffer.initPingPongPass(width, height); 
    }
    
    initTextureParams(texture:IBaseTexture2):void {
        this.texture.initTextureParams(texture); 
    }

    glMirrorMeshObject(meshObject:IMeshObject):void  {
        this.buffer.glMirrorMeshObject(meshObject); 
    }

    resizeCanvasToDisplaySize(multiplier?:number):boolean {
        return this.canvas.resizeCanvasToDisplaySize(multiplier); 
    }

    resizeFramebuffer(fb:Framebuffer, width:number, height:number):void {
        this._framebuffer.resizeFramebuffer(fb, width, height); 
    }

    resizePingPongPipeline(width:number, height:number):void {
        this._framebuffer.resizePingPongPipeline(width, height); 
    }

    resizeTexture(texture:IBaseTexture2, width:number, height:number, sourceElement?:HTMLImageElement):void {
        this.texture.resizeTexture(texture, width, height, sourceElement); 
    }
    
    updateBuffer(buffer:ArrayBuffer, offset:number, glBuffer:GLArrayBuffer):void {
        this.buffer.updateBuffer(buffer, offset, glBuffer);
    }
    
    useShader(glShader:GLShader):void {
        this.shader.use(glShader.program); 
    }
}

