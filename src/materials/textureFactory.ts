import { DepthTexture2D } from "./depthTexture2D";
import { RenderTexture2D } from "./renderTexture2d";
import { Texture2D } from "./texture2d";


export class TextureFactory {
    // TODO: implement later when you got more Materials
    private _classifiersToClassNames:Record<string,string>; 

    constructor() {
        console.log("TextureFactory"); 
    }
    public static createFromJSON(json:string):unknown {
        const settings = JSON.parse(json); 
        if(settings.classifier == "texture2D") {
            return Texture2D.createFromJSON(json); 
        } 
        else if(settings.classifier == "renderTexture2D") {
            return RenderTexture2D.createFromJSON(json); 
        } 
        else if(settings.classifier == "depthTexture2D") {
            return DepthTexture2D.createFromJSON(json); 
        }
    }
}