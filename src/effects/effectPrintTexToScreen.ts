import { DrawBufferOptimizationType, DrawStaticPrimitiveType } from "../constants/constants";
import { TextureRenderingTarget } from "../materials/ITextureRenderingTarget";
import { GLArrayBuffer } from "../mesh/GLBuffer";
import { Effect2D } from "./effect2D"
import { Effect2DSurface } from "./effect2DSurface";


// Just a debug class. 
export class Effect2DDrawTextureToCanvas extends Effect2D {
    
    constructor(name:string, uuid?:string) {
        super(name, DrawStaticPrimitiveType.TRIANGLES, uuid); 

        this.material = new Effect2DSurface("EffectDrawTexture");
        this.material.addRequirement("texture2D");
        this.material.useInputTexture = true; 
        this._genBuffers(); 
    }

    
    private _genBuffers():void {
        const position = new Float32Array(
            [
                -1.0,  1.0, 0.0, 
                -1.0, -1.0, 0.0,
                 1.0, -1.0, 0.0,
                -1.0,  1.0, 0.0,
                 1.0, -1.0, 0.0,
                 1.0,  1.0, 0.0,
            ]
        ); 
        
        const texCoord = new Float32Array(
            [
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 1.0
            ]
        ); 
        
        const glPositionBuffer = new GLArrayBuffer(DrawBufferOptimizationType.STATIC_DRAW, position.length); 
        glPositionBuffer.setAttribPtrData(3, false, 0, 0);
        
        const glTexBuffer = new GLArrayBuffer(DrawBufferOptimizationType.STATIC_DRAW, texCoord.length); 
        glTexBuffer.setAttribPtrData(2, false, 0, 0);  
        
        this.material.setInputTextureUniformName("texture"); 
        this.setArrayBuffers("position", position, glPositionBuffer); 
        this.setArrayBuffers("texCoord", texCoord, glTexBuffer); 
    }

    getTextureRenderingTargets():Set<TextureRenderingTarget> {
        return new Set<TextureRenderingTarget>(); 
      }
}
    