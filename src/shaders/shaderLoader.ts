import { v4 as uuidv4 } from 'uuid';
import { sha256 } from 'js-sha256';

import { IWebGLLayer } from "../webglLayer/webglLayer"
import { GLShader, UniformList, AttribList } from "../materials/GLShader"

import { AttribListCreator } from "./attribListCreate"
import { UniformListCreator } from "./uniformListCreate"

import { ShaderPreprocessing } from './preprocessing';
import { ShaderMatcher } from './shaderMatcher';

/* We just keep these local for now */
import { includesToFiles } from "./shaderIncludes"; 
import { requirementsToAttributes } from './requirementsToUniforms';
import { requirementsToDefines } from "./requirementsToDefines"; 
import { requirementsToUniforms } from './requirementsToUniforms';
import { shaderList } from "./shaderList"; 


/**
 * Analyzes a material and either loads an existing shader or creates a new one. 
 * It's the link between the WebGLLayer and Materials. It uses the WebGLLayer to create shaders, and Material to know what to create. 
 * Shaders are never destroyed during a programs duration (they are expensive to create). 
 * 
 * Custom shaders: they are buffered on names. So any new shader you add must have a unique name if you don't want it overwritten. 
 * TODO: Hash existing vShaders and fShaders instead? Problem: just an additional comment in the shaders will flag similar strings as different. 
 * 
 * hard-coded attrib names in shaders: position, normal, tangent, texCoord. Not expected to change. 
 * 
 * hard-coded texture names in shaders: every Sampler 2D that is mirrored in Material as a Texture r named the same in both places. 
 * This way we don't need to spend extra time matching uniform-names to Material-textures and do extra work to match Sampler2D's to textures when 
 * setting texture units during rendering. 
 * 
 * Explanation of requirements: TODO: add 
 */
export class ShaderLoader {
    private _webGlLayer:IWebGLLayer; 
    private _shaderPreprocessing:ShaderPreprocessing; 
    private _shaderMatcher:ShaderMatcher; 
    private _attribListCreator:AttribListCreator; 
    private _uniformListCreator:UniformListCreator; 

    /* Give each shader a unique ID so items can be quickly sorted based on their shaders */
    private _currShaderID:number; 

    private _shaders:Record<string,GLShader>; 

    /* */
    private _namedCustomShaders:Record<string,GLShader>; 
    
    constructor(webGlLayer:IWebGLLayer) {
                
        this._webGlLayer = webGlLayer; 
        this._shaders = {}; 
        this._namedCustomShaders = {}; 
        
        this._currShaderID = 0; 

        /* Matches a main shader in /src/shaders/shaders against requirements */
        this._shaderMatcher = new ShaderMatcher(shaderList); 
        
        /* Pre-processed a main shader to set includes + uses requirements to set the right defines */
        this._shaderPreprocessing = new ShaderPreprocessing(requirementsToDefines, includesToFiles); 
        this._attribListCreator = new AttribListCreator(requirementsToAttributes); 
        this._uniformListCreator = new UniformListCreator(requirementsToUniforms); 
    }

    /**
     * Returns a clone of a shader in the shaderLibrary. If the shader does not exist there it is created. 
     * @param requirements 
     * @returns 
     */
    public getShader(requirements:Set<string>):GLShader {
        const requirementHash:string = this._createRequirementHash(requirements); 

        if(requirementHash in this._shaders) {
            /* We give out the same shader, but uniform and attrib lists must be unique so materials can set their
             * own uniforms without overwriting other material instances uniforms. GLShader.clone() handles that for us. 
             */
            return this._shaders[requirementHash].clone(); 
        }
        
        const vShaderProto = this._shaderMatcher.getVertexShader(requirements); 
        const fShaderProto = this._shaderMatcher.getFragmentShader(requirements); 
        
        /* The main shaders must be pre-processed against the requirements to know which #defines to include */
        const vShader = this._shaderPreprocessing.constructShader(vShaderProto, requirements); 
        const fShader = this._shaderPreprocessing.constructShader(fShaderProto, requirements); 
        
        const shader:WebGLProgram | null = this._webGlLayer.createShader(vShader, fShader); 

        // TODO: handle better
        if(!shader) {
            throw("createShader(): _webGlLayer.createShader() failed")
        }
        
        // TODO: add error handling 
        let uniformList:UniformList = this._uniformListCreator.getProtoUniformList(requirements); 
        uniformList = this._webGlLayer.loadUniforms(shader, uniformList);

        let attribList:AttribList = this._attribListCreator.getProtoAttribList(requirements); 
        attribList = this._webGlLayer.loadAttribs(shader, attribList); 
        
        // TODO: remove the uuid from GLShader? Is it really needed? 
        const glShader = new GLShader(uuidv4(), shader, uniformList, attribList, this._currShaderID++); 

        this._shaders[requirementHash] = glShader; 

        return this._shaders[requirementHash].clone(); 
    }
    
    /**
     * 
     * @param name Custom shaders are buffered too. Names must be unique. 
     * @param vShader 
     * @param fShader 
     * @param uniformList 
     * @param attribList 
     */
    getCustomShader(name:string, vShader:string, fShader:string, uniformList:UniformList, attribList:AttribList):GLShader {
        if(name in this._namedCustomShaders) {
            /* We give out the same shader, but uniform and attrib lists must be unique so materials can set their
             * own uniforms without overwriting other material instances uniforms. GLShader.clone() handles that for us. 
             */
            return this._namedCustomShaders[name].clone(); 
        }
        
        const shader:WebGLProgram | null = this._webGlLayer.createShader(vShader, fShader); 
        
        // TODO: handle better
        if(!shader) {
            throw("getCustomShader(): _webGlLayer.createShader() failed")
        }
        
        // TODO: add error handling 
        uniformList = this._webGlLayer.loadUniforms(shader, uniformList);
        attribList = this._webGlLayer.loadAttribs(shader, attribList); 
        
        const glShader = new GLShader(uuidv4(), shader, uniformList, attribList, this._currShaderID++); 
        
        this._shaders[name] = glShader; 
        
        return this._shaders[name].clone(); 
    }
    
    /**
     * Make a sorted array of the set, then do a sha256 of its json version. 
     * TODO: This could probably be done faster and/or more elegant, but is it worth it? Profile. 
     * 
     * @param requirements 
     * @returns 
     */
    private _createRequirementHash(requirements:Set<string>):string {
        const arr = [...requirements]; 
        arr.sort(); 
        const arrStr = JSON.stringify(arr); 
        const sha = sha256(arrStr); 

        return sha; 
    }
} 


