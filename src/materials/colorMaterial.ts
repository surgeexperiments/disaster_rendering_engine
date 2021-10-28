import { BaseSurface } from './baseSurface';
import { SerializeCreate, staticImplements } from '../interfaces/serialize';

// NOTE: For now images are NOT serialized. Only their names are added to the Tex 

 @staticImplements<SerializeCreate>() 
export class ColorMaterial extends BaseSurface {

    private _color: Float32Array; 


    constructor(name:string, uuid?:string) {
        super(name, uuid); 
        this._classifier = "ColorMaterial"; 
        
        this._requirements.add("basic"); 
        this._requirements.add("color"); 
    }
    
    get classifier():string {
        return this._classifier; 
    }

    set color(color:Float32Array){
        if(this._glShader) {
            this._glShader.setUniformValue("color", color); 
        } 
        this._color = color; 
    }
    
    // TODO: fix: this could be undefined. Set to null? 
    get color():Float32Array {
        return this._color; 
    }
    
    
    public setSurfaceAttribute(name:string, value:unknown):void {
        if(name == "color") {
            this.color = value as Float32Array; 
        } else {
            throw new Error("ColorMaterial.setSurfaceAttribute(): unknown attribute name"); 
        }
    }

    public getSurfaceAttribute(name:string):unknown {
        if(name == "color") {
            return this._color; 
        } else {
            throw new Error("ColorMaterial.getSurfaceAttribute(): unknown attribute name"); 
        }
    }



    /* For materials loaded from JSON we need to set uniforms when we initially get the shader */
    // TODO: remove? 
    setInitialUniformValues():void { 
        if(this._color) {
            this._glShader.setUniformValue("color", this._color); 
        }
    }


    public updateUniformValues():void {
        this._glShader.setUniformValue("color", this._color); 
    }


    jsonify():string {
        const proto:Record<string, unknown> = {}; 
        proto.super = super.jsonify(); 
        
        if(this._color) {
            proto.color = this._color; 
        }

        return JSON.stringify(proto); 
    }
    
    public static createFromJSON(json:string):ColorMaterial {
        const settings = JSON.parse(json); 
        
        const material = new ColorMaterial(settings.name); 
        material.setFromJSON(settings.super); 

        if(settings.color) {
            material._color = settings.color; 
        }
        
        return material; 
    }
}





