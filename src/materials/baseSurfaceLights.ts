import { DirectionalLight } from "../light/directionalLight";
import { PointLight } from "../light/pointLight";
import { SpotLight } from "../light/spotLight";
import { BaseSurface } from "./baseSurface";


/**
 * You don't want to put light functions on surfaces unless specifically required. 
 */
export abstract class BaseSurfaceLight extends BaseSurface {
    abstract registerDirectionalLight(light: DirectionalLight): boolean; 
    abstract removeDirectionalLight(light: DirectionalLight): boolean; 
    abstract registerSpotLight(light: SpotLight): boolean; 
    abstract unregisterSpotLight(light: SpotLight): boolean; 
    abstract registerPointLight(light: PointLight): boolean; 
    abstract unregisterPointLight(light: PointLight): boolean;   
}