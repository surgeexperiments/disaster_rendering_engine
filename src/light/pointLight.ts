import { PositionedLight } from "./positionedLight";


export class PointLight extends PositionedLight  {
    constructor(name:string, depthTexWidth?:number, depthTexHeight?:number) {
        super(name, depthTexWidth, depthTexHeight); 
    }
}

