import { ColorMaterial } from "./colorMaterial";
import { DepthTextureRenderMaterial } from "./depthTextureRenderMaterial";
import { PhongMaterialBasic } from "./phongMaterialBasic";
import { TextureMaterial } from "./TextureMaterial";

export class MaterialFactory {
    // TODO: implement later when you got more Materials
    private _classifiersToClassNames:Record<string,string>; 

    constructor() {
        console.log("MaterialFactory"); 
    }
    public static createFromJSON(json:string):unknown {
        // TODO: parse everything just to get the name? TODO: make createFromJSON in
        // classes take settings instead? createFromSettings?
        const settings = JSON.parse(json); 
        if(settings.classifier == "ColorMaterial") {
            return ColorMaterial.createFromJSON(json); 
        } 
        else if(settings.classifier == "TextureMaterial") {
            return TextureMaterial.createFromJSON(json); 
        } 
        else if(settings.classifier == "PhongMaterialBasic") {
            return PhongMaterialBasic.createFromJSON(json); 
        } 
        else if(settings.classifier == "DepthTextureRenderMaterial") {
            return DepthTextureRenderMaterial.createFromJSON(json); 
        }
    }
}