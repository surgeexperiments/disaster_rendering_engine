import { BaseSurface } from '../materials/baseSurface';
import { SerializeCreate, staticImplements } from '../interfaces/serialize';


/* Hack to get around interfaces not supporting static methods */
@staticImplements<SerializeCreate>() 
export class Effect2DSurface extends BaseSurface {
    
    public useInputTexture=false; 
    private _inputTextureUnit:number; 
    private _inputTextureUniformName:string; 


    constructor(name:string, uuid?:string) {
        super(name, uuid); 
        
        /* NOTE: base material needs the basic requirement to get the basic shader. In derived classes: add/remove 
           to get the shader you want. */
        this._requirements.add("basicEffect2D"); 
    }
    
    /**
     * Use as part of the loading 
     * If you use "requirements" to generate the shader you got to find the texture uniform name in the generated shader and set it here. 
     * @param name 
     */
    public setInputTextureUniformName(name:string):void {
        this._inputTextureUniformName = name; 
    }
    
    /**
     * NOTE: before calling this: ensure that the uniform name for the input texture is set through setInputTextureUniformName(). 
     */
    public setInputTextureUnit(textureUnit:number):void {
        /* TODO: this is kinda weak. This function should not b called before glMirroring is done. Throw an error instead? */
        if(this.glUniformList) {
            this._inputTextureUnit = textureUnit; 
            this.glUniformList[this._inputTextureUniformName].value = textureUnit; 
        }
    }
    

    /* NOTE: ensure that when you set color/texture, the correct shader has been initialized */
    public setSurfaceAttribute(name:string, value:unknown):void {
        throw new Error("BaseMaterial.setSurfaceAttribute(): unknown attribute name"); 
    }

    public getSurfaceAttribute(name:string):unknown {
        throw new Error("BaseMaterial.getSurfaceAttribute(): unknown attribute name"); 
    }



    // TODO: implement 
    public setInitialUniformValues():void {
        //console.log("lwin"); 
    }

    public updateUniformValues():void {
        // 
    }

    public getTextureURLs():Set<string> {
        const retVals = new Set<string>();  
        return retVals; 
    }

    public jsonify():string {
        return ""; 
    }

    public setFromJSON():void {
        console.log("Lol"); 
    }
    
    public static createFromJSON():Effect2DSurface {
        return (0 as unknown) as Effect2DSurface; 
    }
}