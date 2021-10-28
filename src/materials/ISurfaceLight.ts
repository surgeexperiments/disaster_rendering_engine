import { DirectionalLight } from "../light/directionalLight";
import { PointLight } from "../light/pointLight";
import { SpotLight } from "../light/spotLight";
import { ISurface } from "./ISurface";



export interface ISurfaceLight extends ISurface {

    
        /* Lights are a basic part of a surface. For inheriting classes that do not support lights: implement this by throwing an error. 
        * Classes (and shaders) will have a limit for how many lights that can be implemented, hence the boolean values.  
        */
        registerDirectionalLight(light:DirectionalLight):boolean;
        removeDirectionalLight(light:DirectionalLight):boolean;
        registerSpotLight(light:SpotLight):boolean;
        unregisterSpotLight(light:SpotLight):boolean;
        registerPointLight(light:PointLight):boolean; 
        unregisterPointLight(light:PointLight):boolean; 
}