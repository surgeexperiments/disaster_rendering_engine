import { DepthBufferRenderPass, RenderTargetType } from "../constants/renderTypes";
import { TextureRenderingTarget } from "../materials/ITextureRenderingTarget";


/**
 * NOTE: Do not re-make this every time, keep one around for each texture rendering target. 
 *       The UUID 
 */
export class LightTextureRenderingTarget implements TextureRenderingTarget {
    /* The uuid can be used by the renderer to ensure that no target is rendered twice.
     * NOTE: If a light needs to render multiple RenderTexture's: ensure that the uuid for each
     *       instance of this class is unique. 
     */
    public uuid:string; 
    public renderOncePerPass:boolean; 

    public active:boolean; 

    /* The renderer will use this to select the appropriate function to render the renderTarget. */
    public renderTargetType:RenderTargetType; 
    
    /* Contains the data the renderer need to render to a specific texture */
    public renderPass: DepthBufferRenderPass; 
    
    /**
     * NOTE: renderPass has to be set before you can use this class 
     * @param parentUUID The UUID 
     * @param renderTarget 
     */
    constructor(uuid:string) {
        this.uuid = uuid; 
        
        /* This is self evident */
        this.renderOncePerPass = true; 
        
        this.renderTargetType = RenderTargetType.SCENE_DEPTH_TEXTURE; 

        this.active = true; 
    }

    public setRenderPass(renderPass:DepthBufferRenderPass):void {
        this.renderPass = renderPass; 
    }
}