import { v4 as uuidv4 } from 'uuid';

import { AttribList, GLShader, UniformList } from "./GLShader";
import { SerializeAndSet } from '../interfaces/serialize';
import { ISurface } from "./ISurface";
import { stringArrayToSet } from '../utils/serializeSet';
import { TextureRenderingTarget } from './ITextureRenderingTarget';
import { IBaseTexture2 } from './IBaseTexture';


export abstract class BaseSurface implements ISurface, SerializeAndSet  {
    // TODO: serialize requirements 
    protected _name:string; 
    protected _uuid:string; 
    
    protected _classifier:string; 

    // A hack to get started experimenting with this class 
    protected _requirements:Set<string>; 

    /* A clone of a GLShader from ShaderLoader. Kept private with getters/setters so we later can implement some error handling */
    protected _glShader:GLShader; 
    protected _useCustomShader=false; 

    /* Lock these down to be safe  */ 
    protected _customShaderName:string; 
    protected _customVertexShader:string; 
    protected _customFragmentShader:string; 
    
    /* Kept private for now: might add some integrity checks to .setCustomShader()? Just let ShaderLoader handle errors? */
    protected _customUniformList:UniformList; 
    protected _customAttribList:AttribList; 
    
    protected _textures:Record<string, IBaseTexture2>; 

    /* The key in both these are the name for the sampler2D uniform for the texture in the shader. 
     * You can only register a TextureRenderingTarget when you've already added the related renderTexture. 
     * When you register a TextureRenderingTarget for a renderTexture-name, the render-texture will b added to the target. 
     * You can deactivate rendering to the TextureRenderingTarget whenever you want. 
     */
    protected _renderTextures:Record<string, IBaseTexture2>; 
    protected _renderTextureTargets:Record<string, TextureRenderingTarget>; 

    /* When setting texture units we have to use all textures and renderTextures. 
     * To speed this process up we keep these and modify them when any texture is added or removed.  
     */
    protected _sortedBaseTextureNames:string[]; 
    protected _sortedBaseTextures:IBaseTexture2[]; 

    public isTransparent=false; 
    
    /* Set to true if the shader should support skinning animation */
    public skinning=false; 
    
    constructor(name:string, uuid?:string) {
        this._name = name; 

        if(!uuid) {
            this._uuid = uuidv4(); 
        } else {
            this._uuid = uuid;
        }

        this._requirements = new Set<string>(); 

        
        this._textures = {}; 

    /* The key in both these are the name for the sampler2D uniform for the texture in the shader. 
     * You can only register a TextureRenderingTarget when you've already added the related renderTexture. 
     * When you register a TextureRenderingTarget for a renderTexture-name, the render-texture will b added to the target. 
     * You can deactivate rendering to the TextureRenderingTarget whenever you want. 
     */
        this._renderTextures = {}; 
        this._renderTextureTargets = {}; 
    }
    
    /* 
     * Set BEFORE ShaderLoader is used. Calling this function is non-reversible. 
     */
    setCustomShader(customShaderName:string, vShader:string, fShader:string, uniformList:UniformList, attribList:AttribList):void {
        this._useCustomShader = true;
        
        this._customShaderName = customShaderName; 
        
        /* TODO: add some integrity checks for the values */
        this._customVertexShader = vShader as string; 
        this._customFragmentShader = fShader as string; 
        
        this._customUniformList = uniformList as UniformList; 
        this._customAttribList = attribList as AttribList;
    }

    get name():string {
        return this._name; 
    }

    get uuid():string {
        return this._uuid; 
    }

    get classifier():string {
        return this._classifier; 
    }

    get useCustomShader():boolean {
        return this._useCustomShader; 
    }

    get customShaderName():string {
        return this._customShaderName; 
    }

    get customVertexShader():string {
        return this._customVertexShader; 
    }

    get customFragmentShader():string {
        return this._customFragmentShader; 
    }

    /* Don't call before glShader has been set haha */
    get glUniformList():UniformList {
        if(this._glShader) {
            return this._glShader.uniforms; 
        }
        
        return {}; 
    }
    
    get glAttribList():AttribList {
        if(this._glShader) {
            return this._glShader.attribs; 
        }
        
        return {}
    }

    get customUniformList():UniformList {
        return this._customUniformList; 
    }

    get customAttribList():AttribList {
        return this._customAttribList;  
    }
    
    get requirements():Set<string> {
        return this._requirements; 
    }  

    get isTextureRenderingTarget():boolean {
        return (Object.keys(this._renderTextureTargets).length > 0); 
    }

    set shader(glShader:GLShader) {
        // TODO: implement some error handling? 
        this._glShader = glShader; 
        //this.setInitialUniformValues(); 
    }

    // TODO: fix: this could be undefined. Set to null? 
    get shader():GLShader {
        return this._glShader; 
    }
    
    addRequirement(req:string):void {
        this._requirements.add(req); 
    }

    delRequirement(req:string):void {
        this._requirements.delete(req); 
    }

    getShaderID():number {
        return this._glShader.id; 
    }
    
    /* Set all initialized textures
     * TODO: replace with a setter? Or add some error checking?
     */
    setTextures(textures:Record<string,IBaseTexture2>):void {
        this._textures = textures; 
        this._updateTextureRenderOrder();
    }

    /* Return all active Textures. The key is the individual Texture name */
    public getTextures():Record<string,IBaseTexture2> {
        return this._textures; 
    }

    public getTexture(name:string):IBaseTexture2 | null {
        if(name in this._textures) {
            return this._textures[name]; 
        }

        return null; 
    }
    
    public addTexture(name:string, texture:IBaseTexture2):void {
        this._textures[name] = texture; 
        this._updateTextureRenderOrder();
    }

    /* For init of all textures with openGL 
     * TODO: Make a copy instead? A bit slower, but much safer
     */
    public getRenderTextures():Record<string,IBaseTexture2> {
        return this._renderTextures; 
    }

    public setRenderTextures(textures:Record<string,IBaseTexture2>):void {
        this._renderTextures = textures; 
        this._updateTextureRenderOrder();
    }

    public getRenderTexture(name:string):IBaseTexture2 | null {
        if(name in this._renderTextures) {
            return this._renderTextures[name]; 
        }
        return null; 
    }

    /* Two functions for setting texture units. 
     * getTexturesForRendering() returns an ordered array of textures that can be bound to texture units. 
     * setTextureUnits() will set texture units in the corresponding uniforms in GLShader starting from firstTextureUnit. Naturally it sets the units 
     *                   in the same order as getTexturesForRendering()
     * 
     * 
     */
    public getTexturesForRendering():IBaseTexture2[] {
        return this._sortedBaseTextures; 
    }

    /* This binds the texture uniforms in the shader to the correct texture units */
    public setTextureUnits(startIndex:number):void {
        for(let i=0; i<this._sortedBaseTextureNames.length; ++i) {
            this._glShader.setUniformValue(this._sortedBaseTextureNames[i], startIndex++); 
        }
        //for(const key in this._sortedBaseTextureNames) {
        //    this._glShader.setUniformValue(key, startIndex++); 
        //}
    }
    
    public addRenderTexture(name:string, renderTexture:IBaseTexture2):void {
        this._renderTextures[name] = renderTexture; 
        this._updateTextureRenderOrder(); 
    }

    /* Sets the internal ordering for textures and renderTextures so we can process texture unit handling fast */
    private _updateTextureRenderOrder():void {
        this._sortedBaseTextureNames = []; 
        this._sortedBaseTextures = []; 

        Object.keys(this._textures)
        .sort()
        .forEach((texUniformName:string, i:number) => {
            this._sortedBaseTextures.push(this._textures[texUniformName]); 
            this._sortedBaseTextureNames.push(texUniformName); 
        });

        Object.keys(this._renderTextures)
        .sort()
        .forEach((texUniformName:string, i:number) => {
            this._sortedBaseTextures.push(this._renderTextures[texUniformName]); 
            this._sortedBaseTextureNames.push(texUniformName); 
        });
    }
    

    /* The renderTexture must already be added  */
    public registerTextureRenderingTarget(renderTextureName:string, renderingTarget:TextureRenderingTarget):boolean {
        if(renderTextureName in this._renderTextures) {
            // TODO: update 
            renderingTarget.renderPass.targetTexture = this._renderTextures[renderTextureName]; 
            this._renderTextureTargets[renderTextureName] = renderingTarget; 

            return true; 
        }

        return false; 
    }
    
    public setTextureRenderingTargetActiveStatus(targetName:string, activeOrNot:boolean):boolean {
        if(targetName in this._renderTextureTargets) {
            this._renderTextureTargets[targetName].active = activeOrNot; 
            return true; 
        }

        return false; 
    }
    
    /**
     * Returns all active textureRenderingTargets
     */
    public getTextureRenderingTargets():Set<TextureRenderingTarget> {
        const targets = new Set<TextureRenderingTarget>(); 

        for(const key in this._renderTextureTargets) {
            if(this._renderTextureTargets[key].active) {
                targets.add(this._renderTextureTargets[key]); 
            }
        }

        return targets; 
    }
    
    public removeTextureRenderingTarget(targetName:string):boolean {
        if(targetName in this._renderTextureTargets) {
            delete this._renderTextureTargets[targetName]; 
            return true; 
        }

        return false; 
    }
    
    public getTextureURLs():Set<string> {
        const urls = new Set<string>(); 
        for(const key in this._textures) {
            if(this._textures[key].url) {
                urls.add(this._textures[key].url as string); 
            }
        } 
        
        return urls; 
    }

    abstract setInitialUniformValues():void; 
    
    setRelevantUniformsFromList(uniforms:Record<string,unknown>):void {
        const localUniformList = this.glUniformList; 
        
        /* Checking if a key exists is O(1) so this should not be problematic. TODO: profile speed. Also in material: set "update" so U can use that in this loop? 
         * Number of uniforms in a shader will rarely go above 10 so it's not that much to optimize here? 
        */
        for(const key in uniforms) {
            if(key in localUniformList) {
                localUniformList[key].value = uniforms[key]; 
            }
        }
    }
    
    abstract setSurfaceAttribute(name:string, value:unknown):void; 
    abstract getSurfaceAttribute(name:string):unknown; 

    abstract updateUniformValues():void; 

    /**
     * Note: Only use after setShader() is called rofl 
     * @param name 
     * @returns attrib or null 
     */
    getShaderAttrib(name:string):number|null {
        if(this._glShader) {
            return this._glShader.getAttribLocation(name); 
        }
        return null; 
    } 

    jsonify():string {
        const proto:Record<string, unknown> = {}; 
        
        proto.name = this.name; 
        proto.uuid = this.uuid; 

        /* JSON.stringify doesn't work with Set. This is a workaround 
         * https://stackoverflow.com/questions/31190885/json-stringify-a-set
        */
        proto.requirements = JSON.stringify([...this._requirements]);
        proto.isTransparent = this.isTransparent; 
        proto.skinning = this.skinning; 
        proto.useCustomShader = this._useCustomShader; 

        /* This is only setable through .setCustomShader() so we should feel safe that the values exist */
        if(this._useCustomShader) {
            proto.customShaderName = this.customShaderName; 
            proto.customVertexShader = this.customVertexShader; 
            proto.customFragmentShader = this.customFragmentShader; 
            proto.customUniformList = this.customUniformList; 
            proto.customAttribList = this._customAttribList; 
        }

        proto.isTransparent = this.isTransparent; 
        proto.skinning = this.skinning; 
        
        return JSON.stringify(proto); 
    }

    setFromJSON(json:string):void {
        const settings = JSON.parse(json); 
        this._name = settings.name; 
        this._uuid = settings.uuid; 
        
        /* JSON.stringify doesn't work with set, so it's serialized as an array */
        this._requirements = stringArrayToSet(JSON.parse(settings.requirements)); 
        this.isTransparent = settings.isTransparent; 
        this.skinning = settings.skinning;

        this._useCustomShader = settings.useCustomShader;
        if(this._useCustomShader) {
            this.setCustomShader(settings.customShaderName, settings.customVertexShader, settings.customFragmentShader, settings.customUniformList, settings.customAttribList); 
        }
        
        // TODO: serialize all render textures and texure rendering targets 
        this.isTransparent = settings.isTransparent; 
        this.skinning = settings.skinning;
    }
}

