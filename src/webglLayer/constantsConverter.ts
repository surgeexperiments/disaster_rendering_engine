import { WebGLRenderingContext } from "../d.ts/WebGLContext";

import {DrawBufferArrayType, DrawBufferOptimizationType, DrawStaticPrimitiveType, FramebufferTextureAttachmentPoint, TextureDataType, TextureFiltering, TextureMipmapFiltering, TexturePixelFormat, TextureType, TextureWrapping} from "../constants/constants"

/**
 * Spewing gl-variables and parameters all over the code is not optimal for various reasons, and the enums in constants/ are easier to deal with. 
 * Some enum variables still have to be converted to their gl-equivivalents when interacting with WebGL. 
 * 
 * This mega-class is not very pretty, but it gets the job done (and prettier than having conversion-code scattered all over). 
 * Since the WebGL api is quite static it won't change much either. 
 * 
 * Most of the GL* classes will store the gl-values when they are created/modified so we don't do lots of
 * unneccessary lookups. Even if that stuff is linear-time, it still adds up and can become a performance burden + more loc.
 * 
 * TODO: Make another class for WebGL2
 */
export class ConstantsConverter {

    public gl: WebGLRenderingContext; 
    
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl; 
    }

    // TODO: add support for WebGL2 enums 
    public drawBufferArrayTypeToGL(drawArrayType:DrawBufferArrayType):number {
        switch(drawArrayType) {
            case DrawBufferArrayType.ARRAY_BUFFER:
                return this.gl.ARRAY_BUFFER;
            case DrawBufferArrayType.ELEMENT_ARRAY_BUFFER:
                return this.gl.ELEMENT_ARRAY_BUFFER
            default:
                throw("drawBufferArrayTypeToGL(): Unknown constant!"); 
        }
    } 

    /**
     * Yes, names are a tad bit long, but it aides memory :)
     * @param drawBufferOptimizationType 
     * @returns 
     */
    public drawBufferOptimizationTypeToGL(drawBufferOptimizationType:DrawBufferOptimizationType):number {
        switch(drawBufferOptimizationType) {
            case DrawBufferOptimizationType.DYNAMIC_DRAW:
                return this.gl.DYNAMIC_DRAW;
            case DrawBufferOptimizationType.STATIC_DRAW:
                return this.gl.STATIC_DRAW; 
            case DrawBufferOptimizationType.STREAM_DRAW:
                return this.gl.STREAM_DRAW; 
            default:
                throw("drawBufferOptimizationTypeToGL(): Unknown constant!"); 
        }
    }

    // TODO: add all 
    public drawStaticPrimititveTypeToGL(drawStaticPrimitiveType:DrawStaticPrimitiveType):number {
        switch(drawStaticPrimitiveType) {
            case DrawStaticPrimitiveType.POINTS:
                return this.gl.POINTS;
            case DrawStaticPrimitiveType.LINES:
                return this.gl.LINES;
            case DrawStaticPrimitiveType.LINE_LOOP:
                return this.gl.LINE_LOOP; 
            case DrawStaticPrimitiveType.LINE_STRIP:
                return this.gl.LINE_STRIP; 
            case DrawStaticPrimitiveType.TRIANGLES:
                return this.gl.TRIANGLES; 
            case DrawStaticPrimitiveType.TRIANGLE_STRIP:
                return this.gl.TRIANGLE_STRIP; 
            case DrawStaticPrimitiveType.TRIANGLE_FAN:
                return this.gl.TRIANGLE_FAN; 
            default:
                throw("drawBufferOptimizationTypeToGL(): Unknown constant!"); 
        }
    }



    public textureTypeToGL(textureType:TextureType):number {
        switch(textureType) {
            case TextureType.TEXTURE_2D:
                return this.gl.TEXTURE_2D;
            case TextureType.TEXTURE_CUBE_MAP:
                return this.gl.TEXTURE_CUBE_MAP; 
            default:
                throw("textureTypeToGL(): Unknown constant!"); 
        }
    }
    
    public textureWrappingToGL(textureWrap:TextureWrapping):number {
        switch(textureWrap) {
            case TextureWrapping.REPEAT:
                return this.gl.REPEAT;
            case TextureWrapping.MIRRORERD_REPEAT:
                return this.gl.MIRRORED_REPEAT; 
            case TextureWrapping.CLAMP_EDGE:
                return this.gl.CLAMP_TO_EDGE; 
            default:
                throw("textureWrappingToGL(): Unknown constant!"); 
        }
    }

    public textureFilteringToGL(textureFiltering:TextureFiltering):number {
        switch(textureFiltering) {
            case TextureFiltering.NEAREST:
                return this.gl.NEAREST;
            case TextureFiltering.BI_LINEAR:
                return this.gl.LINEAR; 
            default:
                throw("textureFilteringToGL(): Unknown constant!"); 
        }
    }
    
    // TODO: THIS IS WRONG 
    public textureMipmapFilteringToGL(textureMipmapFiltering:TextureMipmapFiltering):number {
        switch(textureMipmapFiltering) {
            case TextureMipmapFiltering.NEAREST_MIPMAP_NEAREST:
                return this.gl.NEAREST_MIPMAP_NEAREST; 
            case TextureMipmapFiltering.NEAREST_MIPMAP_LINEAR:
                return this.gl.NEAREST_MIPMAP_LINEAR
            case TextureMipmapFiltering.LINEAR_MIPMAP_LINEAR:
                return this.gl.LINEAR_MIPMAP_LINEAR; 
            default:
                throw("textureMipmapFilteringToGL(): Unknown constant!"); 
        }
    }
    
    public texturePixelFormatToGL(texturePixelFormat:TexturePixelFormat):number {
        switch(texturePixelFormat) {
            case TexturePixelFormat.RGBA:
                return this.gl.RGBA;
            case TexturePixelFormat.RGB:
                return this.gl.RGB; 
            case TexturePixelFormat.LUMINANCE_ALPHA:
                return this.gl.LUMINANCE_ALPHA; 
            case TexturePixelFormat.LUMINANCE:
                return this.gl.LUMINANCE; 
            case TexturePixelFormat.ALPHA:
                return this.gl.ALPHA; 
            case TexturePixelFormat.DEPTH_COMPONENT:
                return this.gl.DEPTH_COMPONENT; 
            default:
                throw("texturePixelFormatToGL(): Unknown constant!"); 
        }
    }
    
    public textureDataTypeToGL(textureDataType:TextureDataType):number {
        switch(textureDataType) {
            case TextureDataType.UNSIGNED_BYTE:
                return this.gl.UNSIGNED_BYTE;
            case TextureDataType.UNSIGNED_SHORT:
                return this.gl.UNSIGNED_SHORT;
            case TextureDataType. UNSIGNED_INT:
                return this.gl.UNSIGNED_INT;
            case TextureDataType.FLOAT:
                return this.gl.FLOAT;
            case TextureDataType.BYTE:
                return this.gl.BYTE;
            case TextureDataType.SHORT:
                return this.gl.SHORT; 
            default:
                throw("textureDataTypeToGL(): Unknown constant!"); 
        }
    }

    public framebufferTextureAttachmentPointToGL(attachmentPoint:FramebufferTextureAttachmentPoint):number {
        switch(attachmentPoint) {
            case FramebufferTextureAttachmentPoint.COLOR_ATTACHMENT0:
                return this.gl.COLOR_ATTACHMENT0; 
            case FramebufferTextureAttachmentPoint.DEPTH_ATTACHMENT:
                return this.gl.DEPTH_ATTACHMENT; 
            case FramebufferTextureAttachmentPoint.STENCIL_ATTACHMENT:
                return this.gl.STENCIL_ATTACHMENT; 
            default:
                throw("textureDataTypeToGL(): Unknown constant!"); 
        }
    }
}

