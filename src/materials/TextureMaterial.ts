import { BaseSurface } from './baseSurface';
import { IBaseTexture2 } from './IBaseTexture';
import { SerializeCreate, staticImplements } from '../interfaces/serialize';

/**
 * @author SurgeExperiments
 * 
 */
 @staticImplements<SerializeCreate>() 
export class TextureMaterial extends BaseSurface {

    constructor(name:string, uuid?:string) {
        super(name, uuid); 
        this._classifier = "TextureMaterial"; 

        /* NOTE: base material needs the basic requirement to get the basic shader. In derived classes: add/remove 
           to get the shader you want. */
        this._requirements.add("basic"); 
        this._requirements.add("texture"); 
    }
    
    get classifier():string {
        return this._classifier; 
    }

    set texture(texture:IBaseTexture2) {
        this.setSurfaceAttribute("texture", texture); 
    }
    
    public setSurfaceAttribute(name:string, value:unknown):void {
        if (name == "texture") {
            this.addTexture(name, value as IBaseTexture2);
        } else {
            throw new Error("TextureMaterial.setSurfaceAttribute(): unknown attribute name"); 
        }
    }

    public getSurfaceAttribute(name:string):unknown {
        if (name == "texture") {
            return this._textures["texture"]; 
        } else {
            throw new Error("TextureMaterial.getSurfaceAttribute(): unknown attribute name"); 
        }
    }


    setInitialUniformValues():void { 
        //
    }


    public updateUniformValues():void {
        //console.log("needed?"); 
    }


    jsonify():string {
        const proto:Record<string, unknown> = {}; 
        proto.super = super.jsonify(); 

        return JSON.stringify(proto); 
    }
    

    /* Shader attribs are not serialized, but regenerated via GL-mirroring */
    public static createFromJSON(json:string):TextureMaterial {
        const settings = JSON.parse(json); 
        
        const material = new TextureMaterial(settings.name); 
        material.setFromJSON(settings.super); 

        return material; 
    }
}





