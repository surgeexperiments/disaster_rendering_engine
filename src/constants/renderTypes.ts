import { GLShader } from "../materials/GLShader";
import { IBaseTexture2 } from "../materials/IBaseTexture";
import { Frustrum } from "../mesh/frustrum";
import { IMeshObject } from "../mesh/IMeshObject";
import { Scene } from "../scene/scene";

/* There are multiple ways of rendering, and each render-target sets uses this value to tell the renderer how to render it */
export enum RenderTargetType {
    SCENE_COLOR,
    SCENE_DEPTH_TEXTURE, 
    EFFECT_2D 
}


/**
 * Things like post-processing effects ect has to be set by the user prior to rendering? 
 */
export interface SceneRenderPass {
    scene:Scene,
    activeCam:string; 
    targetTexture:IBaseTexture2; 
    // TODO: certain post effects migth be required that is not part of the main scene
    // The renderer will store the previous postEffectChain and restore it after rendering. 
    postEffectChain:string[]; 
}


export interface DepthBufferRenderPass {
    /* If set to null: use the current scene the renderer is rendering */
    scene:Scene|null,
    /* For the current depth-render method we do not use the shader for the material of a mesh, but one depth-shader for all the items */
    shader:GLShader,
    /* These must be updated uniforms for the shader */
    uniforms:Record<string,unknown>,
    frustrum:Frustrum; 
    /* The position of the light or other item we are looking from */
    camPosition:Float32Array; 
    targetTexture:IBaseTexture2; 
}

export interface Effect2DRenderPass {
    effect:IMeshObject,
    targetTexture:IBaseTexture2; 
}






