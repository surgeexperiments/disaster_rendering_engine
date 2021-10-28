import { BaseLight } from "./baseLight";


export class PositionedLight extends BaseLight {
    worldPosition:Float32Array;  
    direction:Float32Array; 

    color:Float32Array; 
    specularColor:Float32Array; 
    shininess:number; 

    constructor(name:string, depthTexWidth?:number, depthTexHeight?:number) {
        super(name, depthTexWidth, depthTexHeight); 
    }
}