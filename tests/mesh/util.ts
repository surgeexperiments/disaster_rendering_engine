import { GLArrayBuffer, GLElementBuffer} from "../../src/mesh/GLBuffer";
import { DrawBufferOptimizationType } from "../../src/constants/constants"

import { TestInstanceAndParams } from "../dataTypes/dataTypes"

export function getArrayBufferAndInitParams(drawType:DrawBufferOptimizationType, length:number, numComponents:number, 
                                            normalize:boolean, stride:number, offset:number):TestInstanceAndParams {
    
    const glBuffer = new GLArrayBuffer(drawType, length); 
    glBuffer.setAttribPtrData(numComponents, normalize, stride, offset); 

    const params = {
        drawType:drawType, 
        length:length,
        numComponents:numComponents,
        normalize:normalize,
        stride:stride, 
        offset:offset
    }

    return {instance:glBuffer, params:params}; 
}


export function getIndexBufferAndInitParams(drawType:DrawBufferOptimizationType, length:number, offset:number):TestInstanceAndParams {
    const glBuffer = new GLElementBuffer(drawType, length); 
    glBuffer.offset = offset; 
    
    const params = {
        drawType:drawType, 
        length:length,
        offset:offset
    }

    return {instance:glBuffer, params:params}; 
}
