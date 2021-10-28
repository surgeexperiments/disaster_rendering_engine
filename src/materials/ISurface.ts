import { AttribList, GLShader, UniformList } from "./GLShader"
import { IBaseTexture2 } from "./IBaseTexture"
import { TextureRenderingTarget } from "./ITextureRenderingTarget"




/**
 * Represent basic surfaces, effects, materials ect. 
 * 
 * Loaders and Renderer mainly uses this interface. 
 * 
 * Two ways of setting shaders: 
    - Use built in shaders. set .useCustomShader to false and add requirements in .requirements. 
      You need to ensure that the requirements are compatible. Selecting to have both one surface color and a surface texture clearly won't work. 

    - Supply a custom shader. Set .useCustomShader to true, and supply customVShader, customFShader, customUniformList and customAttribList. 
      ShaderLoader will use these to create a glShader for you. 
      NOTE: ShaderLoader uses names to differentiate between custom shaders, so the new shader name must be unique. 

   TODO: 
   - For now we have one render-texture target, but getRenderTextures() and setRenderTextures() implies more than one. 
     Add support for multiple render-textures? 
 */
export interface ISurface {
    uuid:string; 
    name:string; 
    
    /* Used by MaterialFactory */
    classifier:string; 

    isTransparent:boolean; 
    isTextureRenderingTarget:boolean; 

    setCustomShader(customShaderName:string, vShader:string, fShader:string, uniformList:UniformList, attribList:AttribList):void; 

    /* Set all initialized textures */
    setTextures(textures:Record<string,IBaseTexture2>):void 
    
    /* Return all active Textures. The key is the individual Texture name */
    getTextures():Record<string,IBaseTexture2>; 
    getTexture(name:string):IBaseTexture2 | null; 
    
    /* Use this to get all render textures so we can initialize with webGL */
    getRenderTextures():Record<string,IBaseTexture2>; 

    /* Use this to give the class instance the initialized versions of the render textures
     * NOTE: technically, this is not needed when getRenderTextures() returns references to RenderTexture-instances, but
     *       this is cleaner and easier to expand. 
     */
    setRenderTextures(textures:Record<string,IBaseTexture2>):void; 
    
    addRenderTexture(name:string, renderTexture:IBaseTexture2):void; 
    getRenderTexture(name:string):IBaseTexture2 | null; 
    /* Two functions for setting texture units. 
     * getTexturesForRendering() returns an ordered array of textures that can be bound to texture units. 
     * setTextureUnits() will set texture units in the corresponding uniforms in GLShader starting from firstTextureUnit. Naturally it sets the units 
     *                   in the same order as getTexturesForRendering()
     */
    getTexturesForRendering():IBaseTexture2[]; 
    setTextureUnits(startIndex:number):void; 
    
    /* When you register a renderingTarget for a texture the renderer will render that target before rendering item it's used for on the main scene
     * Clearly: renderTextureName must exist on the class that's implementing this function. 
     */
    registerTextureRenderingTarget(renderTextureName:string, renderingTarget:TextureRenderingTarget):boolean;
    removeTextureRenderingTarget(renderTextureName:string):boolean; 
    getTextureRenderingTargets():Set<TextureRenderingTarget>; 

    getTextureURLs():Set<string>;  
    
    /* This stores the actual shader and the list of uniforms and attribs that is used by renderer. */
    shader:GLShader; 
    glUniformList:UniformList; 
    glAttribList:AttribList; 
    getShaderAttrib(name:string):number|null; 
    getShaderID():number; 
    
    customShaderName:string; 
    customVertexShader:string; 
    customFragmentShader:string; 
    customUniformList:UniformList; 
    customAttribList:AttribList; 
    
    useCustomShader:boolean; 
    
    /* Only used if customShader == false */
    requirements:Set<string>; 
    
    addRequirement(req:string):void;
    delRequirement(req:string):void; 

    /* Generic way to set things like color, textures ect. The inheriting instance must known how to handle these 
     * values. 
     */
    setSurfaceAttribute(name:string, value:unknown):void; 
    getSurfaceAttribute(name:string):unknown; 
    
    // registerTextureRenderingTarget(): Implement this later 

    setInitialUniformValues():void; 
    updateUniformValues():void 

    /* Give a bunch of uniforms to the surface. The surface will then set the ones that it has in its own uniformlist. 
     * This isn't optimal in terms of speed (but still O(n) and 2-20 items max) and it removes lots of dependencies.
     */
    setRelevantUniformsFromList(uniformList:Record<string,unknown>):void; 

    jsonify():string; 

    setFromJSON(json:string):void; 
}




