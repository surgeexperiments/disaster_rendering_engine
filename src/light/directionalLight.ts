import { vec3 } from "../math/gl-matrix";
import { PositionedLight } from "./positionedLight";


/**
 * Even though DirectionalLight is just a vector without a position in space, we need
 * to position it and have a frustrum for it to compute shadow maps, so we extend BaseLight. 
 * 
 * Uniform: vec3 reverseDirection
 */
export class DirectionalLight extends PositionedLight {

    constructor(name:string) {
        super(name); 
    }

    /* Need the reversed light vector to compute the dot product in the shaders */
    getReversedDirectionVector():Float32Array {
        const reversed = vec3.create(); 
        vec3.scale(reversed, this.direction, -1); 
        return reversed; 
    }
}
