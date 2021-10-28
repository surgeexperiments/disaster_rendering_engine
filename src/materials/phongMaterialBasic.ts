import { DirectionalLight } from '../light/directionalLight';
import { AttribList, UniformList } from "./GLShader";
import { PointLight } from "../light/pointLight";
import { SpotLight } from "../light/spotLight";
import { BaseSurfaceLight } from "./baseSurfaceLights";
import { IBaseTexture2 } from './IBaseTexture';
import { TextureRenderingTarget } from './ITextureRenderingTarget';



/**
 * @author SurgeExperiments
 * 
 * 
 * Simple Phong material for colored or textured items without any textures like specular maps ect. 
 * 
 */
export class PhongMaterialBasic extends BaseSurfaceLight {
    
    private _color: Float32Array; 

    /* If false: use color, if true use texture. The class will output a different shader, uniform and attribList based on this setting */
    private _useTexture=false; 
    
    private _directionalLight:DirectionalLight | null; 
    private _pointLights:PointLight[]; 
    private _spotLights:SpotLight[]; 

    private _updateDirectionalLightUniforms = true;
    private _updatePointLightUniforms=true; 
    private _updateSpotLightUniforms=true; 
    
    /* NOTE: these must match the defines in the shader! */
    private _MAX_POINT_LIGHTS=2; 
    private _MAX_SPOT_LIGHTS=2; 

    /**
     * @useTexture is required to set the correct shader. 
     *             You can't change this later. If you need both a color and a texture shader: create two materials. 
     */
    constructor(name:string, useTexture:boolean, uuid?:string) {
        super(name, uuid); 

        this._classifier = "PhongMaterialBasic"; 

        /* NOTE: base material needs the basic requirement to get the basic shader. In derived classes: add/remove 
           to get the shader you want. */
           this._useCustomShader = true; 

        this._useTexture = useTexture; 

        this._pointLights = []; 
        this._spotLights = []; 

        /* Have a default value in case somebody forgets to set it */
        this.color = new Float32Array([244, 244, 244, 1]); 

        this._setShader(); 
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
    
    set texture(texture:IBaseTexture2){
        this.addTexture("texture", texture);
    }
    
    // TODO: fix: this could be undefined. Set to null? 
    get texture():IBaseTexture2 {
        return this._textures["texture"]  
    }

    /* PhongMaterial has two sets of texture rendering targets. It's own (at least later), and 
     * the texture rendering targets of the lights (depth textures for shadow mapping) 
     */
    public getTextureRenderingTargets():Set<TextureRenderingTarget> {
        const targets = super.getTextureRenderingTargets(); 

        const tmp = this._getLightsTextureRenderingTargets(); 
        tmp.forEach(targets.add, targets); 

        return targets; 
    }

    private _getLightsTextureRenderingTargets():Set<TextureRenderingTarget> {
        const targets = new Set<TextureRenderingTarget>(); 
 
        // TODO: There has to be a better way to do this with the sets! 
        if(this._directionalLight) {
            const tmp = this._directionalLight.getTextureRenderingTargets();
            tmp.forEach(targets.add, targets); 
        }
        
        for(let i=0; i<this._pointLights.length; ++i) {
            const tmp = this._pointLights[i].getTextureRenderingTargets();
            tmp.forEach(targets.add, targets); 
        }

        for(let i=0; i<this._spotLights.length; ++i) {
            const tmp = this._spotLights[i].getTextureRenderingTargets();
            tmp.forEach(targets.add, targets); 
        }
        
        return targets; 
    } 

    /**
     * When rendering all texture units must get unique texture units set in the shader. 
     * 
     * @param startIndex 
     */
    setTextureUnits(startIndex:number):void {
        if(this._useTexture) {
            super.setTextureUnits(startIndex); 
        }
    }

    /**
     * NOTE: the order these are returned in must be the same order as used in setTextureUnits() 
     */
    getTexturesForRendering():IBaseTexture2[] {
        if(this._useTexture) {
            return super.getTexturesForRendering(); 
        }

        return []; 
    }
    
    
    setInitialUniformValues():void { 
        if(this._color) {
            this._glShader.setUniformValue("color", this._color); 
        }
    }
    
    /* This function will create all uniform-values needed, including the ones from the lights and skinning animation matricies */
    public updateUniformValues():void {
        if(this._updateDirectionalLightUniforms) {
            if(this._directionalLight) {
                this._activateDirectionalLight(); 
            } else {
                this._deactivateDirectionalLight(); 
            }

            this._updateDirectionalLightUniforms = false; 
        }
    
        if(this._updatePointLightUniforms) {
            for(let i=0; i<this._MAX_POINT_LIGHTS; ++i) {
                if(i< this._pointLights.length) {
                    this._activatePointLight(i); 
                } else {
                    this._deactivatePointLight(i); 
                }
            }
            
            this._updatePointLightUniforms = false; 
        }
        
        if(this._updateSpotLightUniforms) {
            for(let i=0; i<this._MAX_SPOT_LIGHTS; ++i) {
                if(i< this._spotLights.length) {
                    this._activateSpotLight(i); 
                } else {
                    this._deactivateSpotLight(i); 
                }
            }

            this._updateSpotLightUniforms = false; 
        } 
    }
    
    private _activateDirectionalLight():void {
        if(this._directionalLight) {
            this._glShader.setUniformValue("directionalLight.active", true); 
            this._glShader.setUniformValue("directionalLight.reverseDirection", this._directionalLight.getReversedDirectionVector()); 
        }
    }

    private _deactivateDirectionalLight():void {
        this._glShader.setUniformValue("directionalLight.active", false); 
        this._glShader.deactivateUniformUpdate("directionalLight.reverseDirection");
    }
    
    private _activatePointLight(index:number):void {
        this._glShader.setUniformValue("pointLights[" + index + "].active", true);
        this._glShader.setUniformValue("pointLights[" + index + "].worldPosition", this._pointLights[index].worldPosition);
        this._glShader.setUniformValue("pointLights[" + index + "].color", this._pointLights[index].color);
        this._glShader.setUniformValue("pointLights[" + index + "].specularColor", this._pointLights[index].specularColor);
        this._glShader.setUniformValue("pointLights[" + index + "].shininess", this._pointLights[index].shininess);
    }
    
    private _deactivatePointLight(index:number):void {
        this._glShader.setUniformValue("pointLights[" + index + "].active", false);
        this._glShader.deactivateUniformUpdate("pointLights[" + index + "].worldPosition");
        this._glShader.deactivateUniformUpdate("pointLights[" + index + "].color");
        this._glShader.deactivateUniformUpdate("pointLights[" + index + "].specularColor");
        this._glShader.deactivateUniformUpdate("pointLights[" + index + "].shininess");
    }

    private _activateSpotLight(index:number):void {
        this._glShader.setUniformValue("spotLights[" + index + "].active", true);
        this._glShader.setUniformValue("spotLights[" + index + "].worldPosition", this._spotLights[index].worldPosition);
        this._glShader.setUniformValue("spotLights[" + index + "].direction", this._spotLights[index].direction);
        this._glShader.setUniformValue("spotLights[" + index + "].color", this._spotLights[index].color);
        this._glShader.setUniformValue("spotLights[" + index + "].specularColor", this._spotLights[index].specularColor);
        this._glShader.setUniformValue("spotLights[" + index + "].shininess", this._spotLights[index].shininess);
        this._glShader.setUniformValue("spotLights[" + index + "].innerMinDotLimit", this._spotLights[index].innerMinDotLimit);
        this._glShader.setUniformValue("spotLights[" + index + "].outerMinDotLimit", this._spotLights[index].outerMinDotLimit)
    }

    private _deactivateSpotLight(index:number):void {
        this._glShader.setUniformValue("spotLights[" + index + "].active", false);
        this._glShader.deactivateUniformUpdate("spotLights[" + index + "].worldPosition");
        this._glShader.deactivateUniformUpdate("spotLights[" + index + "].direction");
        this._glShader.deactivateUniformUpdate("spotLights[" + index + "].color");
        this._glShader.deactivateUniformUpdate("spotLights[" + index + "].specularColor");
        this._glShader.deactivateUniformUpdate("spotLights[" + index + "].shininess");
        this._glShader.deactivateUniformUpdate("spotLights[" + index + "].innerMinDotLimit");
        this._glShader.deactivateUniformUpdate("spotLights[" + index + "].outerMinDotLimit")
    }
    
    
    // Will overwrite the existing
    registerDirectionalLight(light:DirectionalLight):boolean {
        this._directionalLight = light; 
        this._updateDirectionalLightUniforms = true;
        return true; 
    }
    
    removeDirectionalLight(light:DirectionalLight):boolean {
        this._directionalLight = null; 
        this._updateDirectionalLightUniforms = true; 
        return true; 
    }
    
    // Only max-limit
    registerSpotLight(light:SpotLight):boolean {
        if(this._spotLights.length >= this._MAX_SPOT_LIGHTS) {
            return false; 
        }
        this._spotLights.push(light); 
        this._updateSpotLightUniforms = true; 
        return true; 
    }

    unregisterSpotLight(light:SpotLight):boolean {
        const index:number = this._spotLights.indexOf(light);
        if (index >= 0) {
            this._spotLights.splice(index, 1);
            this._updateSpotLightUniforms = true; 
            return true; 
        }
        return false; 
    }

    
    registerPointLight(light:PointLight):boolean {
        if(this._pointLights.length >= this._MAX_POINT_LIGHTS) {
            return false; 
        }
        this._pointLights.push(light); 
        this._updatePointLightUniforms = true; 
        return true; 
    }
    
    unregisterPointLight(light:PointLight):boolean {
        const index:number = this._pointLights.indexOf(light);
        if (index >= 0) {
            this._pointLights.splice(index, 1);
            this._updatePointLightUniforms = true; 
            return true; 
        }
        return false; 
    }
    
    /* NOTE: ensure that when you set color/texture, the correct shader has been initialized */
    public setSurfaceAttribute(name:string, value:unknown):void {
        if(name == "color") {
            this.color = value as Float32Array; 
            /* This might be used before glMirroring. If so, .setInitialUniformValues() will set the color val */
            if(this._glShader) {
                this._glShader.setUniformValue("color", value); 
            }
        } else if (name == "texture") {
            this.texture = value as IBaseTexture2;
        } else {
            throw new Error("BaseMaterial.setSurfaceAttribute(): unknown attribute name"); 
        }
    }

    public getSurfaceAttribute(name:string):unknown {
        if(name == "color") {
            return this._color; 
        } else if (name == "texture") {
            return this.texture; 
        } else {
            throw new Error("BaseMaterial.getSurfaceAttribute(): unknown attribute name"); 
        }
    }

    /* TODO: addSpecularMap() ect */
    jsonify():string {
        const proto:Record<string, unknown> = {}; 
        proto.super = super.jsonify(); 
        

        if(this._color) {
            proto.color = this._color; 
        }

        proto.useTexture = this._useTexture; 

        return JSON.stringify(proto); 
    }
    

    /* Shader attribs are not serialized, but regenerated via GL-mirroring */
    public static createFromJSON(json:string):PhongMaterialBasic {
        const settings = JSON.parse(json); 
        
        const material = new PhongMaterialBasic(settings.name, settings.useTexture); 
        material.setFromJSON(settings.super); 

        if(settings.color) {
            material._color = settings.color; 
        }

        /*
        if(settings.specularMap) {
            const specularMap  = Texture.createFromJSON(settings.glTexSpecularMap);  
            material.specularMap = specularMap; 
        }
        */
        
        return material; 
    }
    
    private _setShader():void {

        const vShaderStart:string = (this._useTexture)?"#define TEXTURE\n":"#define COLOR\n"; 

        const vShader = `
        attribute vec3 position; 
        attribute vec3 normal; 

        #ifdef TEXTURE 
            attribute vec2 texCoord;
        #endif 
        
        /* camera.viewProjection * node.worldMatrix */
        uniform mat4 modelViewProjectionMatrix; 

        /* World matrix of the node */
        uniform mat4 worldMatrix; 

        /* The inversed and transposed world matrix for the node. 
        * The inverse and transpose operations removes the scaling from the worldMatrix, which we do not
        * want to apply to the normal. 
        */
        uniform mat4 worldMatrixInverseTranspose; 
        
        varying vec3 v_fragmentWorldPosition; 
        varying vec3 v_normal; 
        
        #ifdef TEXTURE 
            varying vec2 v_texCoord;
        #endif 

        void main() {
            gl_Position = modelViewProjectionMatrix * vec4(position, 1.0); 

            /* Normals are a direction so we ignore translation. Orientation is in the mat3(). */
            v_normal = mat3(worldMatrixInverseTranspose) * normal; 
            v_fragmentWorldPosition = vec3(worldMatrix * vec4(position, 1.0)); 

            #ifdef TEXTURE 
                v_texCoord = texCoord;
            #endif
        }
        `;
    
        /* precision must be at the beginning of the fragment shader */
        const fShaderStart:string = (this._useTexture)?"precision highp float;\n#define TEXTURE\n":"precision highp float;\n#define COLOR\n"; 

        const fShader = `
        struct DirectionalLight {
            bool active; 
            vec3 reverseDirection; 
            //vec3 origin; 
            // vec3 lookAt?; Allows us to use the camera3D node data directly in the struct/uniforms 
        }; 
        
        struct PointLight {
            vec3 worldPosition; 
            //vec3 direction; 
            
            bool active; 
            vec3 color; 
            vec3 specularColor; 
            float shininess; 
        };
        
        struct SpotLight {
            vec3 worldPosition; 
            vec3 direction; 
        
            bool active; 
            vec3 color; 
            vec3 specularColor; 
            float shininess; 
        
            /* Angles are measured by the dot product (dot == 1 means angle is 0) 
            * For [0,innerMinDotLimit) light is at max strength
            * For [innerMinDotLimit, outerMinDotLimit] light strength is interpolated 
            */ 
            float innerMinDotLimit; 
            float outerMinDotLimit; 
        };
        
        struct LightData {
            float light; 
            vec3 specular; 
        };
        
        #define MAX_POINT_LIGHTS 2
        #define MAX_SPOT_LIGHTS 2 
        
        uniform DirectionalLight directionalLight; 
        uniform PointLight pointLights[MAX_POINT_LIGHTS]; 
        uniform SpotLight spotLights[MAX_SPOT_LIGHTS]; 
        
        uniform vec3 viewerWorldPosition; 
        
        #ifdef TEXTURE
            uniform sampler2D texture; 
        #else 
            uniform vec4 color;
        #endif 
         

        varying vec3 v_normal; 
        varying vec3 v_fragmentWorldPosition; 
        
        #ifdef TEXTURE
            varying vec2 v_texCoord;  
        #endif
        
        void computeDirectionalLight(DirectionalLight light, vec3 normal, inout LightData retVal); 
        void computePointLight(PointLight light, vec3 fragmentWorldPosition, vec3 normal, vec3 surfaceToViewerDirection, inout LightData retVal); 
        void computeSpotLight(SpotLight light, vec3 fragmentWorldPosition, vec3 normal, vec3 surfaceToViewerDirection, inout LightData retVal); 
        
        
        void main() {
            /* v_normal is interpolated and interpolated vectors are not unit vectors */
            vec3 normal = normalize(v_normal); 
            vec3 surfaceToViewerDir = normalize(viewerWorldPosition - v_fragmentWorldPosition);
            
            LightData lightData = LightData(0.0, vec3(0.0)); 
        
            if(directionalLight.active) {
                computeDirectionalLight(directionalLight, normal, lightData); 
            }

            for(int i=0; i<MAX_POINT_LIGHTS; ++i) {
                /* Putting these inside the computing functions didnt work. TODO: some weird GLSL branching stuff? */
                if(pointLights[i].active == false) {
                    continue; 
                }
                computePointLight(pointLights[i], v_fragmentWorldPosition, normal, surfaceToViewerDir, lightData);
            }
            
            for(int i=0; i<MAX_POINT_LIGHTS; ++i) {
                if(spotLights[i].active == false) {
                    continue; 
                }
                computeSpotLight(spotLights[i], v_fragmentWorldPosition, normal, surfaceToViewerDir, lightData);
            }
            
            #ifdef TEXTURE
                gl_FragColor = texture2D(texture, v_texCoord); 
            #else 
                gl_FragColor = color; 
            #endif 
            
            gl_FragColor.rgb *= lightData.light; 
            gl_FragColor.rgb += lightData.specular; 
        }
        
        // TODO: add specular light to the directional! (After updating the struct)
        void computeDirectionalLight(DirectionalLight light, vec3 normal, inout LightData retVal) {
            float lightVal = dot(normal, light.reverseDirection);
            retVal.light += clamp(lightVal, 0.0, 1.0); 
        }
        
        // TODO: optimize 
        void computePointLight(PointLight light, vec3 fragmentWorldPosition, vec3 normal, vec3 surfaceToViewerDirection, inout LightData retVal) {

            vec3 surfaceToLightDirection = normalize(light.worldPosition - fragmentWorldPosition); 
            float lightVal = dot(surfaceToLightDirection, normal); 

            if(lightVal > 0.0) {
                retVal.light += lightVal; 
                vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewerDirection); 
                retVal.specular += pow(dot(halfVector, normal), light.shininess) * light.specularColor; 
            } 
        }
        
        // TODO: optimize 
        void computeSpotLight(SpotLight light, vec3 fragmentWorldPosition, vec3 normal, vec3 surfaceToViewerDirection, inout LightData retVal) {
            
            vec3 surfaceToLightDirection = normalize(light.worldPosition - fragmentWorldPosition); 
            vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewerDirection); 
            
            float dotFromDirection = dot(surfaceToLightDirection, -light.direction); 
            float inLight = smoothstep(light.outerMinDotLimit, light.innerMinDotLimit, dotFromDirection); 

            float lightVal = inLight * dot(surfaceToLightDirection, normal); 

            if(lightVal > 0.0) {
                retVal.light += lightVal; 
                retVal.specular += inLight * pow(dot(normal, halfVector), light.shininess); 
            }
        }
        `;

        const customUniformList:UniformList = {}; 

        customUniformList.modelViewProjectionMatrix = {
            type: "mat4",
            uniformLocation: -1,
            update: true,
            value: null
        }

        customUniformList.worldMatrix = {
            type: "mat4",
            uniformLocation: -1,
            update: true,
            value: null
        }

        customUniformList.worldMatrixInverseTranspose = {
            type: "mat4",
            uniformLocation: -1,
            update: true,
            value: null
        }

        if(this._useTexture) {
            customUniformList.texture = {
                type: "sampler2D",
                uniformLocation: -1,
                update: false,
                value: null
            }
        } else {
            customUniformList.color = {
                type: "vec4",
                uniformLocation: -1,
                update: true,
                value: null
            }
        }

        customUniformList["directionalLight.active"] = {
            type: "bool",
            uniformLocation: -1,
            update: true,
            value: false
        }

        customUniformList["directionalLight.reverseDirection"] = {
            type: "vec3",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["pointLights[0].active"] = {
            type: "bool",
            uniformLocation: -1,
            update: true,
            value: false
        }

        customUniformList["pointLights[0].worldPosition"] = {
            type: "vec3",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["pointLights[0].color"] = {
            type: "vec3",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["pointLights[0].specularColor"] = {
            type: "vec3",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["pointLights[0].shininess"] = {
            type: "float",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["pointLights[1].active"] = {
            type: "bool",
            uniformLocation: -1,
            update: true,
            value: false
        }

        customUniformList["spotLights[0].active"] = {
            type: "bool",
            uniformLocation: -1,
            update:true,
            value: false
        }


        customUniformList["spotLights[0].worldPosition"] = {
            type: "vec3",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["spotLights[0].direction"] = {
            type: "vec3",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["spotLights[0].color"] = {
            type: "vec3",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["spotLights[0].specularColor"] = {
            type: "vec3",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["spotLights[0].shininess"] = {
            type: "float",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["spotLights[0].innerMinDotLimit"] = {
            type: "float",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["spotLights[0].outerMinDotLimit"] = {
            type: "float",
            uniformLocation: -1,
            update: false,
            value: null
        }

        customUniformList["spotLights[1].active"] = {
            type: "bool",
            uniformLocation: -1,
            update: true,
            value: false
        }

        customUniformList.color = {
            type: "vec4",
            uniformLocation: -1,
            update: true,
            value: null
        }

        const customAttribList:AttribList = {}; 

        customAttribList.position = {
            type: "vec2",
            attribLocation: -1
        }; 

        customAttribList.normal = {
            type: "vec3",
            attribLocation: -1
        }; 

        if(this._useTexture) {
            customAttribList.texCoord = {
                type: "vec2",
                attribLocation: -1
            }; 
        }

        const shaderName = (this._useTexture)?"PhongBasicShaderTexture":"PhongBasicShaderColor"; 

        this.setCustomShader(shaderName, vShaderStart + vShader, fShaderStart + fShader, customUniformList, customAttribList); 
    }
}





