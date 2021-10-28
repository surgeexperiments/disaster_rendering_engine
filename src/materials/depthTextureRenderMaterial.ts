import { SerializeCreate, staticImplements } from "../interfaces/serialize";
import { BaseSurface } from "./baseSurface";
import { IBaseTexture2 } from "./IBaseTexture";


@staticImplements<SerializeCreate>() 
export class DepthTextureRenderMaterial extends BaseSurface {

    constructor(name:string, uuid?:string) {
        super(name, uuid); 
        this._classifier = "DepthTextureRenderMaterial"; 

        /* NOTE: base material needs the basic requirement to get the basic shader. In derived classes: add/remove 
           to get the shader you want. */
        this._requirements.add("depthTextureRender"); 
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


    /* TODO: addSpecularMap() ect */
    jsonify():string {
        const proto:Record<string, unknown> = {}; 
        proto.super = super.jsonify(); 

        return JSON.stringify(proto); 
    }
    

    /* Shader attribs are not serialized, but regenerated via GL-mirroring */
    public static createFromJSON(json:string):DepthTextureRenderMaterial {
        const settings = JSON.parse(json); 
        
        const material = new DepthTextureRenderMaterial(settings.name); 
        material.setFromJSON(settings.super); 

        return material; 
    }
}





