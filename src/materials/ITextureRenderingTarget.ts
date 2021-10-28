import { RenderTargetType } from "../constants/renderTypes";
import { DepthBufferRenderPass, Effect2DRenderPass, SceneRenderPass } from "../constants/renderTypes";


/**
 * Things like lights, materials ect can have texture that needs something rendered to before they themselves can be rendered. 
 * This could be a depth texture for a light (for shadows), or a texture of a rear-view-mirror of a car game before the mirror is rendered on the main scene. 
 * This interface helps the renderer know how to deal with the rendering target when it renders them as part of the scene rendering process. 
 */
export interface TextureRenderingTarget {
    /* Things like a lights depth buffer should only be rendered once, but it could potentially be supplied multiple times if we are rendering 
     * a scene many times due to having multiple texture rendering targets where the same light is used. 
     *
     * If renderOnce == true, uuid will be stored in the renderer after the target has rendered, 
     * and any future textureRenderingTarget that has renderOnce set will be checked to see if it matches this uuid during the same renderPass.
     * 
     * NOTE: If an instance is to do multiple texture-rendering targets it's that class responsibility that the uuid for each instance of
     *       it's implementation of TextureRenderingTarget is unique (if not: only one will render lol). Simple way to do this is: uuid + some other info.  
     */
    uuid:string; 
    renderOncePerPass:boolean; 
    
    /* False == target not rendered */
    active:boolean; 

    /* The renderer will use this to select the appropriate function to render the renderTarget. 
     * NOTE: could just do typeOf on renderTarget instead, but the enum is a bit cleaner.
     */
    renderTargetType:RenderTargetType; 
    
    /* Contains the data the renderer need to render to a specific texture */
    renderPass:SceneRenderPass | DepthBufferRenderPass | Effect2DRenderPass; 
}
