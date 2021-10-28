import { IWebGLLayer } from "../webglLayer/webglLayer";
import { RenderList, RenderListGenerator } from "./renderList";
import { Scene } from "../scene/scene";
import { mat4, vec2, vec3 } from "../math/gl-matrix";
import { WorldMesh } from "../mesh/WorldMesh";
import { ShaderLoader } from "../shaders/shaderLoader";
import { Framebuffer } from "../webglLayer/framebuffer";
import { ISurface } from "../materials/ISurface";
import { GLArrayBuffer } from "../mesh/GLBuffer";
import { Effect2DDrawTextureToCanvas } from "../effects/effectPrintTexToScreen";
import { Effect2D } from "../effects/effect2D";
import { IMeshObject } from "../mesh/IMeshObject";
import { RenderTexture2D } from "../materials/renderTexture2d";
import { IBaseTexture2 } from "../materials/IBaseTexture";
import { TextureRenderingTarget } from "../materials/ITextureRenderingTarget";
import { DepthBufferRenderPass, RenderTargetType } from "../constants/renderTypes";


/**
 * Canvas resizing: 
 *  Built in assets 
 *      - The renderer has a few assets that are built in. These will be resized if the canvas changes size. 
 *      : Render texture and associated framebuffer made by _createTextureRenderTarget()
 *      : LayerFramebuffer ping-pong pipeline
 *  Camera: 
 *      - Any camera in the current scene must have it's aspect ratio reset  
 * 
 * Uniform values from the renderer: 
 * - The renderer will set certain uniform values that will be available to any mesh or effect that is to be rendered. 
 * - These will have standardized names (which must be matched by the uniform-name): 
 * : time : elapsed time in milliseconds 
 * : resolution: canvas resolution 
 * 
 * 
 * the render function will always call resizeCanvasToDisplaySize(). This sets canvas.width/height to equal clientWidth/clientHeight, 
 * so they will always be equal after that. 
 */
export class Renderer {
    private _layer:IWebGLLayer; 
    private _shaderLoader:ShaderLoader; 
    private _renderList:RenderList; 
    private _currScene:Scene; 
    
    private _renderBoundingBoxes = false; 
    private _renderCameraFrustrums = false; 

    /* WorldMeshes used to render these items. Gives the user flexibility in terms of how these are rendered. */
    private _boundingBoxWorldMesh:WorldMesh; 
    private _cameraFrustrumWorldMesh:WorldMesh; 
    
    private _renderListGenerator:RenderListGenerator; 
    
    /* To do post-processing */
    private _framebuffer:Framebuffer; 
    private _renderTexture:RenderTexture2D; 

    /* To render depth buffers (kept separate from _framebuffer for now) */
    private _depthFramebuffer:Framebuffer; 
    private _depthFramebufferColorTexture:RenderTexture2D; 

    // TODO: made public just so we can use SceneLoader to init it for now 
    public _finalPostProcessingStep:Effect2DDrawTextureToCanvas; 

    /* Track UUID's (TODO: fix unique increasing number id) for texture rendering passes so we don't render one target multiple times (like in recursive calls) */
    private _textureRenderingTargetsRenderedThisPass:Set<string>; 

    constructor(webGLLayer:IWebGLLayer, shaderLoader:ShaderLoader) {
        this._layer = webGLLayer; 
        this._shaderLoader = shaderLoader; 
        this._renderListGenerator = new RenderListGenerator(); 

        // Set up Framebuffers so we can render to a texture and do post-processing and other tricks 
        this._createTextureRenderTarget(this._layer.canvasWidth(), this._layer.canvasHeight()); 
        this._createFinalPostProcessingStep(); 
        this._createDepthTextureRenderTarget(); 
        /* Allocates two framebuffers and textures so we can do post processing with multiple effects chained 
        TODO: Add the ping piog buffers and textures to the canvas resize event! 
        */
        this._layer.setupPingPongPipeline(this._layer.canvasWidth(), this._layer.canvasHeight()); 
    }

    /****************** CREATE AND MANAGE ASSETS THE RENDERER NEEDS **************** */

    private _createTextureRenderTarget(width:number, height:number):void { 
        this._framebuffer = this._layer.createFrameBuffer(width, height, true, true); 

        this._renderTexture = new RenderTexture2D("Renderer:RenderTexForPostProcessing", width, height); 
        this._layer.initGLTexture(this._renderTexture.glTexture); 
        this._layer.initTextureParams(this._renderTexture); 
        //this._renderTexture = this._layer.createRenderTexture("Renderer:RenderTexForPostProcessing", width, height); 

        this._layer.attachRenderTextureToFrameBuffer(this._renderTexture, this._framebuffer); 
    }
    
    /**
     * NOTE: For now we keep this depth framebuffer separate
     * @param width 
     * @param height 
     */
    private _createDepthTextureRenderTarget():void {
        /* Width and height doesn't matter here as we will resize when needed anyway */
        this._depthFramebuffer = this._layer.createFrameBuffer(512, 512, true, true); 

        /* The size for this at init time doesn't matter. It will be resized to equal the size of any current depth texture render target */
        this._depthFramebufferColorTexture = new RenderTexture2D("Renderer:RenderColorTexForDepthFramebuffer", 512, 512);
        this._layer.initGLTexture(this._depthFramebufferColorTexture.glTexture); 
        this._layer.initTextureParams(this._depthFramebufferColorTexture);
        
        this._layer.attachRenderTextureToFrameBuffer(this._depthFramebufferColorTexture, this._depthFramebuffer, true); 
    }
    
    private _resizeTextureRenderTarget(width:number, height:number):void {
        this._layer.resizeFramebuffer(this._framebuffer, width, height); 
        this._layer.resizeTexture(this._renderTexture, width, height); 
    }
    
    /* Create the effect that draws the final post processed scene texture to the canvas */
    private _createFinalPostProcessingStep():void {
        /* Test post processing effects */
        this._finalPostProcessingStep = new Effect2DDrawTextureToCanvas("Renderer:EffectRenderFinalProcessedSceneToCanvas"); 
    }

    private _resizeRendererAssets(width:number, height:number):void {
        // Update LayerFramebuffer ping pong pipeline 
        this._layer.resizePingPongPipeline(width, height); 
        
        // Update the built-in render-texture and the associated framebuffer 
        this._resizeTextureRenderTarget(width, height); 
    }


    /****************** DEBUGGING FUNCTIONS *****************/

    /**
     * Activate the drawing of bounding boxes. The parameter has to be set once.  
     * 
     * @param worldMesh This has to be set the first time calling this function! If it's passed after initial setup the new one will be used. 
     *                  This is mesh that will be used to draw AABB boxes and/or the Camera frustrums. 
     *                  It should be a mesh that is set to DrawBufferOptimizationType.DYNAMIC_DRAW (as it will be used to draw every AABB box).
     *                  The position and index buffer should be of length 24, and you probably want it to be initialized to draw lines. 
     *                  The material needs to be opaque. 
     */
    public drawBoundingBoxes(boundingBoxWorldMesh?:WorldMesh):void {
        if(boundingBoxWorldMesh) {
            this._boundingBoxWorldMesh = boundingBoxWorldMesh; 
            this._renderBoundingBoxes = true; 
        } else {
            if(this._boundingBoxWorldMesh) {
                this._renderBoundingBoxes = true; 
            } else {
                throw new Error("drawBoundingBoxes(): activation of bounding-box rendering but no boundingBoxWorldMesh set!")
            }
        }
    }

    public deactivateDrawBoundingBoxes():void {
        this._renderBoundingBoxes = false; 
    }
    
    /**
     * Activate the drawing of bounding boxes. The parameter has to be set once.
     * 
     * @param worldMesh This has to be set the first time calling this function! If it's passed after initial setup the new one will be used. 
     *                  This is mesh that will be used to draw AABB boxes and/or the Camera frustrums. 
     *                  It should be a mesh that is set to DrawBufferOptimizationType.DYNAMIC_DRAW (as it will be used to draw every AABB box).
     *                  The position and index buffer should be of length 24, and you probably want it to be initialized to draw lines. 
     */
     public drawCameraFrustrums(cameraFrustrumWorldMesh?:WorldMesh):void {
        if(cameraFrustrumWorldMesh) {
            this._cameraFrustrumWorldMesh = cameraFrustrumWorldMesh; 
            this._renderCameraFrustrums = true; 
        } else {
            if(this._cameraFrustrumWorldMesh) {
                this._renderCameraFrustrums = true; 
            } else {
                throw new Error("drawCameraFrustrums(): activation of camera-frustrum rendering but no cameraFrustrumWorldMesh set!")
            }
        }
    }


    public deactivateDrawCameraFrustrums():void {
        this._renderCameraFrustrums = false; 
    }


    /****************** RENDERING FUNCTIONS *****************/

    // TODO: remove?
    public renderScene(scene:Scene):void {
        this._currScene = scene; 
        this.render(0); 
    }

    public setScene(scene:Scene):void {
        this._currScene = scene; 
    }
    
    // TODO: For now this can only do DEPTH_targets 
    private _renderTextureRenderingTargets(targets:Set<TextureRenderingTarget>):void {
        
        for(const target of targets) {
            /* Only render each target once (in case of recursive calls we need to track this) */
            if(this._textureRenderingTargetsRenderedThisPass.has(target.uuid)) {
                continue; 
            }
            this._textureRenderingTargetsRenderedThisPass.add(target.uuid); 
            if(target.renderTargetType == RenderTargetType.SCENE_DEPTH_TEXTURE) {
                this._renderDepthTexture(target); 
            }
        }
    }
    
    // TODO: This function is not ready. 
    private _renderDepthTexture(target:TextureRenderingTarget):void {  
        const renderPass:DepthBufferRenderPass = target.renderPass as DepthBufferRenderPass; 

        // TODO: the ability to select other scenes than the current is not implemented 
        const renderList = this._renderListGenerator.genRenderListNoTransparency(this._currScene.worldMeshes, renderPass.frustrum, renderPass.camPosition);

        // REMOVE: use the 
        //const renderList = this._renderListGenerator.genRenderListNoTransparency(this._currScene.worldMeshes, this._currScene.getActiveCamera().frustrum, 
        //                                                                         this._currScene.getActiveCamera().translate);

        /* Set up framebuffer to render with the depth texture */
        const width = renderPass.targetTexture.width; 
        const height = renderPass.targetTexture.height; 
        
        this._layer.resizeFramebuffer(this._depthFramebuffer, width, height); 
        this._layer.resizeTexture(this._depthFramebufferColorTexture, width, height); 
        this._layer.attachRenderTextureToFrameBuffer(renderPass.targetTexture, this._depthFramebuffer); 
        this._layer.attachRenderTextureToFrameBuffer(this._depthFramebufferColorTexture, this._depthFramebuffer); 
        this._layer.setFramebuffer(this._depthFramebuffer.framebuffer, width, height); 
        
        //this._layer.clearCanvas(100, 10, 100, 1); 
        this._layer.clearCanvasDepthBuffer(); 
        this._layer.clearCanvasColorBuffer(); 

        this._layer.enableDepthTest(); 
        this._layer.enableDepthWriting();
        
        /* Set up the shader */
        //for(const key in renderPass.uniforms) {
        //    renderPass.shader.setUniformValue(key, renderPass.uniforms[key]);
        //}
        
        // TODO: add skinning to depth buffer creation? Needed? 
        this._layer.useShader(renderPass.shader); 
        
        for(let i=0; i<renderList.opaque.length; ++i) {
            const mesh = renderList.opaque[i]; 
            // TODO: this is a manual hack due to time constraints! Fix. 
            const modelViewProjectionMatrix = mat4.create(); 
            //mat4.multiply(modelViewProjectionMatrix, renderPass.uniforms["viewProjectionMatrix"] as Float32Array, mesh.worldMatrix as Float32Array); 

            // REMOVE: testing to see if it works with the active camera 
            mat4.multiply(modelViewProjectionMatrix, this._currScene.getActiveCamera().worldMatrix as Float32Array, mesh.worldMatrix as Float32Array); 
            renderPass.shader.setUniformValue("modelViewProjectionMatrix", modelViewProjectionMatrix);
            
            // TODO: bind bone arrays and weights if skinned animation is used 
            this._layer.bindArrayBufferToShaderAttrib(mesh.glMesh.getArrayBuffer("position") as GLArrayBuffer, 
                                                      renderPass.shader.getAttribLocation("position") as number); 

            /* Since we are not using a VAO we need to bind the element buffer, henche: last arg == true */
            this._layer.draw(mesh.glMesh, true); 
        }
        
        /* Set to canvas rendering */
        this._layer.setFramebuffer(null, this._layer.canvasWidth(), this._layer.canvasHeight()); 
    }

    
    // TODO: add stats for the number of vertices being rendered
    public render(time:number):void {

        /* Set up basic stuff */
        const scene = this._currScene; 
        const activeCamera = scene.getActiveCamera(); 

        /* If this returns true then the canvas has been resized, and we need to update camera aspect, framebuffers and render textures */
        if(this._layer.resizeCanvasToDisplaySize()) {
            this._resizeRendererAssets(this._layer.canvasWidth(), this._layer.canvasHeight()); 
            activeCamera.rebuildPerspectiveMatrixFromAspectChange(this._layer.getCanvasAspect()); 
        }
        
        activeCamera.setViewProjectionMatrixAndFrustrum(); 
        const renderList = this._renderListGenerator.genRenderList(scene.worldMeshes, activeCamera.frustrum, activeCamera.translate, true); 

        /* Render all textureRenderingTargets first. We can't render a mesh or use a light if they have not had their renderTextures or depth textures rendered */
        this._textureRenderingTargetsRenderedThisPass = new Set<string>(); 
        this._renderTextureRenderingTargets(renderList.textureRenderingTargets); 

        /* If we need to do post processing we got to render to a texture first and do post processing on that. If not we render directly to the canvas */
        if(scene.doPostProcessing) {
            this._layer.setFramebuffer(this._framebuffer.framebuffer, this._layer.canvasWidth(), this._layer.canvasHeight()); 
        } else {
            this._layer.setFramebuffer(null, this._layer.canvasWidth(), this._layer.canvasHeight()); 
        }

        this._layer.clearCanvas(0,0,0,1); 
        
        this._layer.enableDepthTest(); 
        this._layer.enableDepthWriting();
        this._layer.disableAlphaBlend(); 

        
        /* Make data from the renderer available */
        const rendererUniforms = {
            time:time, 
            resolution: vec2.fromValues(this._layer.canvasWidth(), this._layer.canvasHeight()) 
            }; 

        
        
        /* Render opaque items */
        let currShader = -1; 
        for(let i=0; i<renderList.opaque.length; ++i) {
            const changeShader = (currShader != renderList.opaque[i].material.getShaderID()) ? true:false; 
            currShader = renderList.opaque[i].material.getShaderID(); 

            this._renderMeshObject(renderList.opaque[i], rendererUniforms, changeShader, 0, activeCamera.viewProjectionMatrix); 
            //this._renderWorldMesh(renderList.opaque[i], activeCamera.viewProjectionMatrix, rendererUniforms, changeShader); 
        }  

        /* Render opaque bounding boxes */
        if(this._renderBoundingBoxes) {
            this._renderWorldMeshBoundingBoxes(renderList.opaque, activeCamera.viewProjectionMatrix); 
        }
        
        /* Render camera frustrum */
        if(this._renderCameraFrustrums) {
            this._renderAllCameraFrustrums(scene, activeCamera.viewProjectionMatrix); 
        }

        
        /* Render transparent items */ 

        /* Enable testing against the depth buffer, but not writing to it. Since we're rendering from the furthest away to 
         * closest to camera with opaque stuff already rendered this will avoid rendering transparent stuff behind something opaque 
         */
        this._layer.disableDepthWriting(); 
        this._layer.enableAlphaBlend(); 
        currShader = -1; 
        for(let i=0; i<renderList.transparent.length; ++i) {
            const changeShader = (currShader != renderList.transparent[i].material.getShaderID()) ? true:false; 
            currShader = renderList.transparent[i].material.getShaderID(); 
            this._renderMeshObject(renderList.transparent[i], rendererUniforms, changeShader, 0, activeCamera.viewProjectionMatrix); 
            //this._renderWorldMesh(renderList.transparent[i], activeCamera.viewProjectionMatrix, rendererUniforms, changeShader); 
        }
        
        /* Render bounding boxes for transparent (turn on depth testing) */
        if(this._renderBoundingBoxes) {
            this._layer.enableDepthTest(); 
            this._renderWorldMeshBoundingBoxes(renderList.transparent, activeCamera.viewProjectionMatrix); 
        }
        

        /* 5: Run post processing */
        if(this._currScene.doPostProcessing) {
            this.runEffectChain(this._currScene.postProcessingEffects, this._renderTexture, rendererUniforms); 
        }
    }
    
    
    /**
     * TODO: This whole scheme does NOT work with the transparency-scheme! 
     * NOTE: This function requires that all AABB boxes are updated when it's called (important for worldMeshes that morphs, ex via skinned animation) 
     * @param worldMeshes
     * @param viewProjectionMatrixCamera 
     */
    private _renderWorldMeshBoundingBoxes(worldMeshes:WorldMesh[], viewProjectionMatrixCamera:Float32Array) {  
        // Can either check the scene to see if any bounding boxes should be rendered first, or bind shader+vao and just loop all worldMeshes afterwards. 
        
        /* Only need to be activated once */
        this._layer.useShader(this._boundingBoxWorldMesh.material.shader); 
        this._layer.bindVAO(this._boundingBoxWorldMesh.vao); 
        
        this._boundingBoxWorldMesh.material.setSurfaceAttribute("color", new Float32Array([0, 255, 0, 1])); 
        
        const modelViewProjectionMatrix = mat4.create(); 
        
        for(let i=0; i<worldMeshes.length; ++i) {
            if(worldMeshes[i].renderBoundingBox) {
                /* 
                The AABB-buffer is in local space, but it is made by accounting for rotation and scaling of the position buffer to get the correct size. 
                To get it rendered correctly we: 
                - Do not include scaling and rotation (it's axis-aligned lol)
                - at the correct place of the figure we need to apply local translate and the parent world matrix of the Node. 
                */
                mat4.multiply(modelViewProjectionMatrix, viewProjectionMatrixCamera, worldMeshes[i].AABBWorldMatrixAndLocalTranslate);  
                
                //this._setMeshUniforms(this._boundingBoxWorldMesh.material, {viewProjectionMatrix: vertexMatrix}); 
                this._setMeshUniforms(this._boundingBoxWorldMesh.material, {modelViewProjectionMatrix: modelViewProjectionMatrix}); 
                const glArrayBuffer = this._boundingBoxWorldMesh.glMesh.getArrayBuffer("position") as GLArrayBuffer; // position; 
                this._layer.updateBuffer(worldMeshes[i].AABBpositionBuffer, 0, glArrayBuffer); 
                this._layer.draw(this._boundingBoxWorldMesh.glMesh); 
            }
        }
    }
    
    
    private _renderAllCameraFrustrums(scene:Scene, viewProjectionMatrixCamera:Float32Array):void {
        /* Only need to be activated once  */
        this._layer.useShader(this._boundingBoxWorldMesh.material.shader); 
        this._layer.bindVAO(this._boundingBoxWorldMesh.vao); 

        this._boundingBoxWorldMesh.material.setSurfaceAttribute("color", new Float32Array([255, 255, 255, 1])); 

        const modelViewProjectionMatrix = mat4.create(); 
        
        for(let i=0; i<scene.cameras.length; ++i) {
            if(scene.cameras[i].renderCameraFrustrum) {
                /*
                Camera buffer is in local space without any rotation or scaling applied to it. 
                */
                
                const lookAtMatrixInverse = mat4.create(); 

                mat4.invert(lookAtMatrixInverse, scene.cameras[i].lookAtMatrix); 

                mat4.multiply(modelViewProjectionMatrix, viewProjectionMatrixCamera, lookAtMatrixInverse);

                this._modifyBufferWithMatrix(scene.cameras[i].frustrumPositionBufferLocal, lookAtMatrixInverse); 

                this._setMeshUniforms(this._boundingBoxWorldMesh.material, {modelViewProjectionMatrix: modelViewProjectionMatrix}); 
                const glArrayBuffer = this._boundingBoxWorldMesh.glMesh.getArrayBuffer("position") as GLArrayBuffer; // position; 
                this._layer.updateBuffer(scene.cameras[i].frustrumPositionBufferLocal, 0, glArrayBuffer); 
                this._layer.draw(this._boundingBoxWorldMesh.glMesh); 
            }
        }
    }

    
    /**
     * 
     * @param worldMesh 
     * @param viewProjectionMatrix 
     * @param additionalUniforms The renderer have data that sometimes needs to be set, like elapsed time. Set those here.  
     */
     private _renderMeshObject(meshObject:IMeshObject, uniforms:Record<string,unknown>, changeShader:boolean, firstTextureUnit:number, viewProjectionMatrixCamera?:Float32Array):void {
        /* Only need to compute this once per mesh */
        if(meshObject.hasWorldMatrix) {
            const modelViewProjectionMatrix = mat4.create(); 
            mat4.multiply(modelViewProjectionMatrix, viewProjectionMatrixCamera as Float32Array, meshObject.worldMatrix as Float32Array); 
            uniforms.modelViewProjectionMatrix = modelViewProjectionMatrix; 
        }
        
        /* Mesh often has data shaders need as uniforms. This will handle that. */
        meshObject.setNodeDataInMaterial(); 

        const material:ISurface = meshObject.material; 
        if(changeShader) {
            this._layer.useShader(material.shader); 
        }
        
        
        /* Each texture has to be assigned a texture unit, and the corresponding sampler2D uniform then has to be given the same unit-value. 
         * calling this._setTextureUnits binds the texture units to the textures in the same order as the array from material.getTexturesForRendering(), 
         * starting from firstTextureUnit.
         * Calling material.setTextureUnits() afterwards sets the corresponding uniform (sampler2D) values for the textures in the same order, 
         * starting from firstTextureUnits. 
         * This way we bind each texture to a unique texture unit, and then set the corresponding sampler2D value to the same unit-value, 
         * without Renderer having to know anything about the details of the texture ordering.
         */
        const textures = material.getTexturesForRendering(); 
        this._setTextureUnits(textures, firstTextureUnit); 
        material.setTextureUnits(firstTextureUnit); 
        
        /* Now the uniforms are updated with the right texture units for each texture we can set them */
        this._setMeshUniforms(material, uniforms); 
        
        this._layer.bindVAO(meshObject.vao); 
        
        this._layer.draw(meshObject.glMesh); 
    }

    /**
     * Sets the texture units in the order the array has 
     * TODO: WebGL 1 (at least?) supports minimum 8 units. Add some error-thrown if the locally supported num of texture units is less than the number being set?
     * @param textures 
     * @param firstUnit 
     */
    private _setTextureUnits(textures:IBaseTexture2[], firstUnit:number):void {
        let currUnit = firstUnit; 
        for(let i=0; i<textures.length; i++) { 
            this._layer.bindTexture(textures[i], currUnit++); 
        }
    }
    
    /* TODO: clearify what this function does. Some uniforms are contained in material and others are set elsewhere */
    private _setMeshUniforms(surface:ISurface, uniforms:Record<string,unknown>):void {
        surface.setRelevantUniformsFromList(uniforms);
        surface.updateUniformValues(); 
 
        this._layer.setUniforms(surface.glUniformList); 
    }

    /**
     * NOTE: Texture unit 0 is ALWAYS set to the input texture, regardless. 
     * 
     * TODO: Throw some error if the first effect requires an input texture and sourceTexture == undefined? 
     * @param effectChain
     * @param sourceTexture if the first effect in the chain needs an input texture 
     */
    runEffectChain(effectChain:Effect2D[], sourceTexture:IBaseTexture2, rendererUniforms:Record<string,unknown>):void {
        
        this._layer.initPingPongPass(this._layer.canvasWidth(), this._layer.canvasHeight()); 

        /* Clear the first framebuffer render target, it might have data from previous render passes. */
        this._layer.clearCanvasColor(0, 0, 0, 1.0);
        this._layer.clearCanvasDepthBuffer(); 
        
        let firstAvailTextureUnit = 0; 

        /* The first effect will use sourceTexture as input. Every effect after that uses the output of the previous effect pass */
        if((effectChain.length > 0) && (effectChain[0].material.useInputTexture)) { 
            this._layer.bindTexture(sourceTexture, firstAvailTextureUnit++); 
            effectChain[0].material.setInputTextureUnit(0); 
        
        /* If there are no effects in the effects chain we need to bind the texture so it can be drawn to the canvas */
        } else if (effectChain.length == 0) {
            this._layer.bindTexture(sourceTexture, firstAvailTextureUnit++); 
            this._finalPostProcessingStep.material.setInputTextureUnit(0); 
        }

        /* The next rendering target (could be the loop or just the canvas if there are no effects) needs to 
         * know the last texture rendered to so it has a data-source.
         */ 
        //this.framebufferHelper.bindCurrentTextureRenderingTarget(textureUnit);  
        
        for (let i = 0; i < effectChain.length; ++i) {
            const currEffect = effectChain[i]; 

            // Render the effect
            const changeShader = ((i == 0) || (i > 0 && effectChain[i].material.getShaderID() != effectChain[i-1].material.getShaderID())) ? true:false; 

            this._renderMeshObject(currEffect, rendererUniforms, changeShader, firstAvailTextureUnit); 
     
            // Set up next pass
            this._layer.getNextPingPongFramebuffer(this._layer.canvasWidth(), this._layer.canvasHeight()); 
            this._layer.clearCanvas(255,255,0,1); 

            firstAvailTextureUnit = 0; 
            
            /* If there are more effects to process and the next one needs an input texture, bind the current rendering target */
            if((i < effectChain.length - 1) && effectChain[i+1].material.useInputTexture) {
                this._layer.bindTexturePreviouslyRenderedTo(firstAvailTextureUnit++);
                effectChain[i+1].material.setInputTextureUnit(0);
            } else {
                /* If this is the last effect we always need to bind the texture rendering target so it can be output to the screen */
                this._layer.bindTexturePreviouslyRenderedTo(firstAvailTextureUnit++);
            }
        }
        
        this._layer.setPingPongToCanvasRendering(this._layer.canvasWidth(), this._layer.canvasHeight()); 
        
        this._layer.clearCanvas(0,0,0,1); 

        this._layer.enableDepthTest(); 
        
        this._layer.enableDepthWriting();
        this._layer.enableAlphaBlend(); 

        /* Draw the stuff to the canvas. The loop ensures that the texture with the final result is bound to texture unit 0 */
        const changeShader = (effectChain.length> 0 && effectChain[effectChain.length-1].material.getShaderID() == this._finalPostProcessingStep.material.getShaderID()) ? false:true; 
        this._renderMeshObject(this._finalPostProcessingStep, rendererUniforms, changeShader, 1); 
    }


    /****************** OTHER *****************/

    // TODO: remove, just a debugging function 
    private _modifyBufferWithMatrix(buffer:Float32Array, morphMatrix:Float32Array, printBuffer?:boolean):void {
        const morphedCoord:Float32Array = vec3.create(); 
        const morphedBuffer:Float32Array = new Float32Array(24); 


        for(let i=0; i<buffer.length; i+=3) {
            morphedCoord[0] = buffer[i]; 
            morphedCoord[1] = buffer[i+1]; 
            morphedCoord[2] = buffer[i+2]; 
            
            vec3.transformMat4(morphedCoord, morphedCoord, morphMatrix);
            
            // TODO: Can't we use references or pointer tricks in javascript to just pass the (arr + offset) .transformMat4? 
            morphedBuffer[i] = morphedCoord[0]; 
            morphedBuffer[i+1] = morphedCoord[1]; 
            morphedBuffer[i+2] = morphedCoord[2]; 
        }

        if(printBuffer) {
            console.log(morphedBuffer); 
        }
    }
}
