

/* TODO: implement in the main ShaderLibrary */
import { BaseSurface } from './baseSurface';
import { IBaseTexture2 } from './IBaseTexture';
import { SerializeCreate, staticImplements } from '../interfaces/serialize';
import { UniformList, AttribList } from './GLShader';


@staticImplements<SerializeCreate>() 
export class SkinnedTextureMaterial extends BaseSurface {

    private _bones:Float32Array[]; 

    constructor(name:string, uuid?:string) {
        super(name, uuid); 
        this._classifier = "SkinnedTextureMaterial"; 

        this._setShader(); 
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

    setBones(bones:Float32Array[]):void {
        this._bones = bones; 
    }

    setInitialUniformValues():void { 
        //
    }
    

    public updateUniformValues():void {
        for(let i=0; i<this._bones.length; ++i) {
            this._glShader.setUniformValue("bones[" + i + "]", this._bones[i]); 
        }
    }


    /* TODO: addSpecularMap() ect */
    jsonify():string {
        const proto:Record<string, unknown> = {}; 
        proto.super = super.jsonify(); 

        return JSON.stringify(proto); 
    }
    

    /* Shader attribs are not serialized, but regenerated via GL-mirroring */
    public static createFromJSON(json:string):SkinnedTextureMaterial {
        const settings = JSON.parse(json); 
        
        const material = new SkinnedTextureMaterial(settings.name); 
        material.setFromJSON(settings.super); 
        
        return material; 
    }


    private _setShader():void {

        const vShader = `
        attribute vec3 position; 
        attribute vec2 texCoord;
        attribute vec4 boneWeights;
        attribute vec4 boneIndices; 

        uniform mat4 modelViewProjectionMatrix;    
        
        #define MAX_BONE_MATRICIES 4 
        #define BONES_PER_VERTEX 4 

        uniform mat4 bones[MAX_BONE_MATRICIES];
        
        varying vec2 v_texCoord;

        // TODO: remove globals? 
        vec3 computeAnimatedPosition(vec3 position) {
            vec4 finalPosition = vec4(0.0); 

            for(int i=0; i<BONES_PER_VERTEX; i++) {
                finalPosition += bones[int(boneIndices[i])] * vec4(position, 1.0) * boneWeights[i]; 
            }            
            
            return vec3(finalPosition); 
        }

        void main() { 
            vec3 posAfterAnimation = computeAnimatedPosition(position); 
            gl_Position = modelViewProjectionMatrix * vec4(posAfterAnimation, 1.0); 
            v_texCoord = texCoord;
        }
        `;
    

        const fShader = `
            precision mediump float;   

            varying vec2 v_texCoord;
            uniform sampler2D texture; 

            void main () {
                gl_FragColor = texture2D(texture, v_texCoord);
            }
        `;

        const customUniformList:UniformList = {}; 

        customUniformList.modelViewProjectionMatrix = {
            type: "mat4",
            uniformLocation: -1,
            update: true,
            value: null
        }
        
        customUniformList.texture = {
            type: "sampler2D",
            uniformLocation: -1,
            update: false,
            value: null
        }
        
        customUniformList["bones[0]"] = {
            type: "mat4",
            uniformLocation: -1,
            update: true,
            value: false
        }

        customUniformList["bones[1]"] = {
            type: "mat4",
            uniformLocation: -1,
            update: true,
            value: false
        }

        customUniformList["bones[2]"] = {
            type: "mat4",
            uniformLocation: -1,
            update: true,
            value: false
        }

        customUniformList["bones[3]"] = {
            type: "mat4",
            uniformLocation: -1,
            update: true,
            value: false
        }

        const customAttribList:AttribList = {}; 

        customAttribList.position = {
            type: "vec3",
            attribLocation: -1
        }; 

        customAttribList.texCoord = {
            type: "vec2",
            attribLocation: -1
        }; 

        customAttribList.boneWeights = {
            type: "vec4",
            attribLocation: -1
        }; 

        customAttribList.boneIndices = {
            type: "vec4",
            attribLocation: -1
        }; 
        
        this.setCustomShader("skinnedAnimationTextureShader", vShader, fShader, customUniformList, customAttribList); 
    }
}





