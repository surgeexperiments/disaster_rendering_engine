import { GLTexture } from "../../src/materials/GLTexture";
import { Texture } from "../../src/materials/texture";
import { GLShader, AttribList, UniformList } from "../../src/materials/GLShader";
import { TexturePixelFormat, TextureDataType, TextureFiltering, TextureType} from "../../src/constants/constants"
import { TestInstanceAndParams } from "../dataTypes/dataTypes"


/**
 * Returns a new GLTexture and the params that were used to create it. 
 */
export function getGLTextureAndInitParams(level:number, internalFormat:TexturePixelFormat, format:TexturePixelFormat, type:TextureDataType, 
                                   textureType:TextureType, flipYAxis:boolean):TestInstanceAndParams {

    const glTexture = new GLTexture(level, internalFormat, format, type, textureType, flipYAxis);
    const params = {
        level:level,
        internalFormat:internalFormat,
        format:format,
        type:type,
        textureType:textureType,
        flipYAxis:flipYAxis
    }; 
    
    return {instance:glTexture, params:params}; 
}


/**
 * 
 * @param name 
 * @param glTexture 
 * @param filteringMin 
 * @param filteringMag 
 * @param is3D 
 * @param uuid If not set it will b undefined in params 
 * @returns 
 */
export function getTextureAndInitParams(name:string, glTexture:GLTexture, filteringMin:TextureFiltering, 
                                        filteringMag:TextureFiltering, is3D:boolean, uuid?:string):TestInstanceAndParams {

    const texture = new Texture(name, glTexture, filteringMin, filteringMag, is3D, uuid); 
    const params = {
        name:name,
        glTexture:glTexture,
        filteringMin:filteringMin,
        filteringMag:filteringMag,
        is3D:is3D,
        uuid:uuid 
    }; 
    
    return {instance:texture, params:params}; 
}


export function getGLShaderAndInitParams(uuid:string, program:WebGLProgram, uniformList:UniformList, attribList:AttribList):TestInstanceAndParams {

    const glShader = new GLShader(uuid, program, uniformList, attribList); 

    const params = {
        uuid:uuid,
        program:program,
        uniformList:uniformList,
        attribList:attribList
    }; 

    return {instance:glShader, params:params}; 
}


export function createExampleUniformList():UniformList {
    const uniformList:UniformList = {}; 

    uniformList.worldMatrix = {
        "type": "mat4",
        "uniformLocation": 0,
        "update": false,
        "value": new Float32Array([1, 2, 3, 4])
    }; 

    uniformList.color = {
        "type": "vec3",
        "uniformLocation": 1,
        "update": false,
        "value": new Float32Array([0xff, 0xff, 0xff])
    }; 

    uniformList.texture = {
        "type": "sampler2D",
        "uniformLocation": 2,
        "update": false,
        "value": 5
    }; 

    return uniformList; 
}


export function createExampleAttribList():AttribList {
    const attribList:AttribList = {}; 
    attribList.position = {
        "type": "vec3",
        "attribLocation": 1
    };

    attribList.normal = {
        "type": "vec3",
        "attribLocation": 2
    };

    return attribList; 
}

    