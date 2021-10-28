import { vec3 } from "../math/gl-matrix";


export class Plane {
    private _normal:Float32Array; 
    private _point:Float32Array;

    private _d:number; 

    constructor() {
        this._normal = vec3.create(); 
        this._point = vec3.create(); 
        this._d = 0; 
    }

    public get normal():Float32Array {
        return this._normal; 
    }

    
    public set3Points( v1:Float32Array, v2:Float32Array, v3:Float32Array):void {

        const aux1 = vec3.create(); 
        vec3.subtract(aux1, v1, v2); 

        const aux2 = vec3.create(); 
        vec3.subtract(aux2, v3, v2); 
        
        vec3.multiply(this._normal, aux2, aux1); 
        
        vec3.normalize(this._normal, this._normal); 
        
        vec3.copy(this._point, v2); 
        
        this._d = vec3.dot(this._normal, this._point); 
    }

    public setNormalAndPoint(normal:Float32Array, point:Float32Array):void {
        vec3.copy(this._normal, normal);    
        vec3.normalize(this._normal, this._normal); 
        this._d = -(vec3.dot(this._normal, point)); 
    }

    public setCoefficients(a:number, b:number, c:number, d:number):void {
        vec3.set(this._normal, a, b, c); 
        const l = vec3.length(this._normal); 

        // normalize 
        vec3.set(this._normal, a/l, b/l, c/l);     
        this._d = d/l; 
    }

    public distance(p:Float32Array):number {
        const val = vec3.dot(this._normal, p); 
        return this._d + val; 
    }

    public print():void {
        console.log("Plane(): ", this._normal[0], this._normal[1], this._normal[2], ":d: ", this._d); 
    }
}


