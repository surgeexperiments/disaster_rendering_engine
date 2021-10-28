import { IWebGLLayer } from "../webglLayer/webglLayer"; 
import { ShaderLoader } from "../shaders/shaderLoader";
import { Scene } from "../scene/scene"; 

import { ResourceLoader } from "./resourceLoader"; 
import { GLMesh } from "../mesh/GLMesh";
import { AttribList } from "../materials/GLShader";
import { WorldMesh } from "../mesh/WorldMesh";

import loadImages from "./imageLoader"; 
import { ISurface } from "../materials/ISurface";
import { IMeshObject } from "../mesh/IMeshObject";
import { Effect2D } from "../effects/effect2D";
import { IBaseTexture2 } from "../materials/IBaseTexture";

/**
 * A list of images, with the keys being their original URL. 
 * The URL's can be matched against the URL stored in the Texture class. 
 */
export interface ImageListURL {
    [url:string]: HTMLImageElement
}

/**
 * KEY ABT LOADING AND DUPLICATION 
 * If a Material has a Texture with an UUID that has already been loaded, you just set the Texture to the loaded instance.
 * If the WorldMesh has the uuid of a material that has been loaded beforer you just set the material to that	
	
: Thus : the uuid decides if the WorldMesh and Material uses existing	
	instances (when it is ok to share) and when they
	require new ones

: How textures are loaded: 
- Each Texture instance must have a url set for the HTMLImage (TODO: add Video) it uses. initScene() will use this URL to load the image and 
  set it up according to the settings in the Texture item. 
- Textures will be cached, so if one Texture instance (same uuid) is used in multiple Materials instances, they will all share the same cached Texture instance. 
 : NOTE: don't use the same Texture instance for multiple materials if you plan to write to it lol :P 

: How TextureEffects are loaded: 
- 

TODO: 
- Implement a function to delete the texture cache and the material cache
- Settings to turn off caching?

 */

interface myCallbackType { (myArgument: Scene): void }


export class SceneLoader {
    
    private _layer:IWebGLLayer; 
    
    /* ShaderLoader caches shaders internally */
    private _shaderLoader:ShaderLoader; 
    private _resourceLoader:ResourceLoader; 
    
    private _textureCache:Record<string,IBaseTexture2>; 
    private _renderTextureCache:Record<string,IBaseTexture2>; 

    /* Any member that implements ISurface, sorted by UUID. TODO: make this more granular? */
    private _surfaceCache:Record<string,ISurface>; 

    constructor(webGLLayer:IWebGLLayer, shaderLoader:ShaderLoader) {
        this._layer = webGLLayer; 
        this._shaderLoader = shaderLoader; 
        this._resourceLoader = new ResourceLoader(); 

        this._textureCache = {}; 
        this._renderTextureCache = {}; 
        this._surfaceCache = {}; 
    }

    /**
     * TODO: fix 
     * @param json json of serialized scene 
     * @returns A scene, or it throws an error containing the failure   
     */
    public loadSceneFromJSON(json:string):Scene {
        const protoScene = Scene.createFromJSON(json); 
        return protoScene; 
        //return this.initScene(protoScene); 
    } 
    
    // TODO: fix up. Need to check for duplicates 
    private _imgArrToImageListURL(imgArr:HTMLImageElement[]):ImageListURL {
        const retVal:ImageListURL = {}; 
        for(let i=0; i<imgArr.length; ++i) {
            retVal[imgArr[i].name] = imgArr[i]; 
        }

        return retVal;  
    }

    // TODO: implement 
    public loadSceneDataFromURL(urlToJSON:string):Scene {
        return Scene.createFromJSON(urlToJSON); 
    }

    /**
     * 
     * @param protoScene A scene with all the data set so it can be loaded and initialized with WebGL. 
     *                   This includes texture urls being set on every Texture instance.
     * @returns a scene that has all textures loaded and that is initialized with WebGL. 
     */
    public initScene(protoScene:Scene, callBack:myCallbackType):void {
        //const textureUrls:Set<string> = protoScene.getTextureURLs();
        const textureUrls:string[] = Array.from(protoScene.getTextureURLs());
        /* This blocks until success and throws an error if loading fails. We want the caller to catch the error. */
        //const that = this; 
        loadImages(textureUrls).then(allImgs => {
            // TODO: omfg, diff format 
            const scene = this._initScene(protoScene, this._imgArrToImageListURL(allImgs)) as Scene; 
            callBack(scene); 
        }).catch(err => {
            throw new Error("FUCK OFF"); 
        }); 
    }

    /**
     * Use this to init a scene you've created with webGL
     * NOTE TODO: This is where the GLMemoryPoolManager comes into play as we register stuff with WebGL here 
     * @param scene TODO: add 
     * @param imageList all the textures used for the entire scene as {name:HTMLImageElement} 
     */
    private _initScene(scene:Scene, imageList:ImageListURL):Scene {
        
        for(let i=0; i<scene.worldMeshes.length;i++) {
            this.initLoadedMeshObject(scene.worldMeshes[i] as WorldMesh, imageList); 
        }
        
        for(const key in scene.effects2D) {
            scene.effects2D[key] = this.initLoadedMeshObject(scene.effects2D[key], imageList) as Effect2D; 
        }

        /* We don't need a separate function for this right now */
        for(const key in scene.lights) {
            this._initSurfaceWithGL(scene.lights[key].material, imageList); 
            // TODO: Put this into some general interface later?  
            scene.lights[key].postGLInstall(); 
        }

        return scene; 
    }

    public initLoadedMeshObject(meshObject:IMeshObject, imageList:ImageListURL):IMeshObject {
        /* Link the material up with a GLShader and init all textures */
        // TODO: sketchy, fix up! 
        //const material = this._initSurfaceWithGL(meshObject.material, imageList) as Material;  
        this._initSurfaceWithGL(meshObject.material, imageList);  
        
        /* GLBuffer needs a reference its matching attrib in the shader before being gl-mirrored. This is available after _initSurfaceWithGL() */
        //this._loadShaderAttribsToGLMesh(meshObject.glMesh, material.glAttribList); 
        this._loadShaderAttribsToGLMesh(meshObject.glMesh, meshObject.material.glAttribList); 

        /* Init buffers with WebGL */
        this._layer.glMirrorMeshObject(meshObject); 
        
        return meshObject; 
    }
    
    /**
     * 
     * @param surface 
     * @param imageList 
     * @returns 
     */
    private _initSurfaceWithGL(surface:ISurface, imageList:ImageListURL):void {
        if(this._surfaceCache[surface.uuid]) {
            surface = this._surfaceCache[surface.uuid]; 
            //return this._surfaceCache[surface.uuid]; 
        }
        
        if(surface.useCustomShader) {
            surface.shader = this._shaderLoader.getCustomShader(surface.customShaderName, surface.customVertexShader, surface.customFragmentShader, 
                                                                surface.customUniformList, surface.customAttribList); 
        } else { 
            surface.shader = this._shaderLoader.getShader(surface.requirements); 
        } 
        
        const textures:Record<string,IBaseTexture2> = this._initTextures(surface.getTextures(), imageList); 
        
        surface.setTextures(textures); 
        
        const renderTextures:Record<string,IBaseTexture2> = this._initRenderTextures(surface.getRenderTextures()); 
        surface.setRenderTextures(renderTextures); 

        /* We need to set initial uniform values like the color in the actual uniforms */
        surface.setInitialUniformValues(); 

        this._surfaceCache[surface.uuid] = surface; 
        
        //return surface; 
    }

    private _initTextures(textures:Record<string,IBaseTexture2>, imageList:ImageListURL):Record<string,IBaseTexture2> {
        for(const key in textures){
            let texture = textures[key]; 
            
            if(this._textureCache[texture.uuid]) {
                texture = this._textureCache[texture.uuid]; 
            } else {
                texture = this._initTexture(texture, imageList[texture.url as string]); 
                this._textureCache[texture.uuid] = texture; 
            }
        } 

        return textures; 
    }   
    
    /**
     * For now: Render textures are not cached. 
     * TODO: Allow them to be cached based on uuid? 
     * @param textures 
     */
    private _initRenderTextures(textures:Record<string,IBaseTexture2>):Record<string,IBaseTexture2> {
        for(const key in textures){
            let texture = textures[key]; 
            
            if(this._renderTextureCache[texture.uuid]) {
                texture = this._renderTextureCache[texture.uuid]; 
            } else {
                //texture = this._layer.initRenderTexture(texture); 
                this._layer.initGLTexture(texture.glTexture); 
                this._layer.initTextureParams(texture);
                this._renderTextureCache[texture.uuid] = texture; 
            }
        } 
        
        return textures; 
    }
    
    private _initTexture(texture:IBaseTexture2, image:HTMLImageElement):IBaseTexture2 {
        this._layer.initGLTexture(texture.glTexture, image); 
        this._layer.initTextureParams(texture); 

        return texture; 
    }

    /**
     * Note: clearly, any GLMesh that is missing some buffers for the attribLocation will crash this function! 
     * The buffer names in glMesh and attribList must also match! 
     */
    private _loadShaderAttribsToGLMesh(glMesh:GLMesh, attribList:AttribList):void {
        for(const key in attribList) {
            glMesh.setShaderAttribInBuffer(key, attribList[key].attribLocation); 
        } 
    }
} 
