import { DepthBufferRenderPass } from "../constants/renderTypes";
import { DepthTexture2D } from "../materials/depthTexture2D";
import { GLShader } from "../materials/GLShader";
import { Frustrum } from "../mesh/frustrum";
import { Scene } from "../scene/scene";


export class LightDepthBufferRenderPass implements DepthBufferRenderPass {
    public scene:Scene | null; 
    public shader:GLShader; 
    public uniforms:Record<string,unknown>; 
    public frustrum:Frustrum; 
    /* For frustrum culling */
    public camPosition:Float32Array; 
    public targetTexture:DepthTexture2D

    /* If scene is null the current scene being rendered will be used */
    constructor(scene:Scene | null, depthShader:GLShader, uniforms:Record<string,unknown>, frustrum:Frustrum, camPosition:Float32Array, targetTexture:DepthTexture2D) {
        this.scene = scene; 
        this.shader = depthShader; 
        this.uniforms = uniforms; 
        this.frustrum = frustrum; 
        this.camPosition = camPosition; 
        this.targetTexture = targetTexture; 
    }
}
