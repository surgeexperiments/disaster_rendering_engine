import { BaseSurface } from "./baseSurface";
import { RenderTexture2D } from "./renderTexture2d";


/* Class to generate a depth texture */
export class DepthTextureMaterial extends BaseSurface {

    constructor(name:string, depthTexWidth:number, depthTexHeight:number, uuid?:string) {
        super(name, uuid); 
        this.requirements.add("depthBuffer"); 
        //this.addRenderTexture("texture", new DepthTexture2D(name, depthTexWidth, depthTexHeight)); 

        // TODO: quick hack to test the depth buffer renderer 
        this.addRenderTexture("texture", new RenderTexture2D(name, depthTexWidth, depthTexHeight)); 
    }

    setInitialUniformValues():void {
        //
    }
    
    setSurfaceAttribute(name:string, value:unknown):void {
        //
    }

    getSurfaceAttribute(name:string):unknown {
        return null; 
    }

    updateUniformValues():void {
        // 
    }
}

 