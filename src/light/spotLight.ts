import { PositionedLight } from "./positionedLight";


export class SpotLight extends PositionedLight  {
    

    /* Angles are measured by the dot product (dot == 1 means angle is 0) 
     * For (0,innerMinDotLimit) light is at max strength
     * For [innerMinDotLimit, outerMinDotLimit] light strength is interpolated 
     */ 
    innerMinDotLimit:number; 
    outerMinDotLimit:number; 

    constructor(name:string, depthTexWidth?:number, depthTexHeight?:number) {
        super(name, depthTexWidth, depthTexHeight); 
    }
}