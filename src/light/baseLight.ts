import { Camera3D } from "../camera/camera";
import { Scene } from "../scene/scene";
import { DepthTextureMaterial } from "../materials/depthTextureMaterial";
import { LightDepthBufferRenderPass } from "./lightBufferRendePass";
import { LightTextureRenderingTarget } from "./lightTextureRenderingTarget";
import { DepthTexture2D } from "../materials/depthTexture2D";
import { TextureRenderingTarget } from "../materials/ITextureRenderingTarget";

/**
 * Requirements 
 * - phong
 * - depthBuffer 
 */
export class BaseLight extends Camera3D {
    material:DepthTextureMaterial; 

    /**
     * Set to null if you want the light to use the current scene that is rendering as the depth-texture source. 
     * Only set to another scene if you are looking for some crazy effects :D 
     */
    public _sceneDepthRenderTarget:Scene|null; 

    /* If set to true, .shadowMap is used. */
    createShadows=false; 
    
    /* The lights direction. All lights except ambient has it */
    direction:Float32Array;  

    
    /* Contains the information the renderer needs to to do a depth-buffer rendering pass */
    private _depthTextureRenderingTarget:LightTextureRenderingTarget; 

    constructor(name:string, depthTexWidth?:number, depthTexHeight?:number) {
        super(name); 
        this.material = new DepthTextureMaterial(name + ":material", (depthTexWidth)?depthTexWidth:512, (depthTexHeight)?depthTexHeight:512);    
        this._sceneDepthRenderTarget = null; 
    }
    
    activateShadows():void {
        this.createShadows = true; 
        this.material.setTextureRenderingTargetActiveStatus("texture", true);
    }

    deactivateShadows():void {
        this.createShadows = false; 
        this.material.setTextureRenderingTargetActiveStatus("texture", false);
    }

    /**
     * We can't create the depth buffer render pass until the GLShader has been set up. 
     * 
     * We create it here, but it's being managed by depthTextureMaterial.
     * Access the active texture rendering targets via material.getTextureRenderingTargets() 
     */
    public postGLInstall():void {
        this.setViewProjectionMatrix(); 
        

        this._depthTextureRenderingTarget = new LightTextureRenderingTarget(this.uuid); 
        
        const depthBufferRenderPass = new LightDepthBufferRenderPass(this._sceneDepthRenderTarget, 
                                                                    this.material.shader, 
                                                                    {"viewProjectionMatrix": this.viewProjectionMatrix}, 
                                                                    this.frustrum,
                                                                    this.translate,
                                                                    this.material.getTexture("texture") as DepthTexture2D);

        this._depthTextureRenderingTarget.setRenderPass(depthBufferRenderPass); 

        /* This will now automatically be sent to the renderer as long as it's marked as active */
        this.material.registerTextureRenderingTarget("texture", this._depthTextureRenderingTarget); 
    }
    
    set sceneDepthRenderTarget(scene:Scene | null) {
        this._sceneDepthRenderTarget = scene; 
    }

    get sceneDepthRenderTarget():Scene | null{
        return this._sceneDepthRenderTarget; 
    }
    
    public getTextureRenderingTargets():Set<TextureRenderingTarget> {
        return this.material.getTextureRenderingTargets(); 
    }

     jsonify():string {
        return ""; 
     }
}



