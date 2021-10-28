import { DrawBufferOptimizationType, DrawStaticPrimitiveType, TextureDataType, TextureFiltering, TexturePixelFormat, TextureType } from "../../src/constants/constants";
import { ColorMaterial } from "../../src/materials/colorMaterial";
import { GLTexture } from "../../src/materials/GLTexture";
import { Texture2D } from "../../src/materials/texture2d";
import { TextureMaterial } from "../../src/materials/TextureMaterial";
import { GLArrayBuffer, GLElementBuffer } from "../../src/mesh/GLBuffer";
import { WorldMesh } from "../../src/mesh/WorldMesh";


export class ItemCreator {
    public createColoredWorldMesh(buffers:Record<string,unknown>, name:string, color:Float32Array, drawStaticPrimitiveType:DrawStaticPrimitiveType, drawBufferOptimizationType:DrawBufferOptimizationType):WorldMesh {
        const material = new ColorMaterial(name); 
        material.color = color; 
        
        const worldMesh = new WorldMesh(name, drawStaticPrimitiveType); 
        worldMesh.material = material; 
        const glPositionBuffer = new GLArrayBuffer(drawBufferOptimizationType, (buffers.position as Float32Array).length); 
        glPositionBuffer.setAttribPtrData(3, false, 0, 0);
        
        const glIndicesBuffer = new GLElementBuffer(drawBufferOptimizationType, (buffers.indices as Uint16Array).length);
        
        // TODO: check with conversion and without, both should work 
        worldMesh.setArrayBufferWithGLUpdate("position", Array.from(buffers.position as Float32Array), glPositionBuffer);
        worldMesh.setIndexBufferWithGLUpdate(Array.from(buffers.indices as Uint16Array), glIndicesBuffer); 
        return worldMesh; 
    }

    /**
     * NOTE: remember to set the scaling on the textureURL properly afterwards so you get the right size. 
     * @param textureURL 
     * @returns 
     */
    public createTextureMesh(textureURL:string, transparent:boolean, texPixelFormat:TexturePixelFormat):WorldMesh {
        const material = new TextureMaterial("texMaterial"); 
        material.isTransparent = transparent;  
        
        //const glTexture = new GLTexture(0, TexturePixelFormat.RGBA, TexturePixelFormat.RGBA, 
        //    TextureDataType.UNSIGNED_BYTE, TextureType.TEXTURE_2D, true);  
        
        const glTexture = new GLTexture(0, texPixelFormat, texPixelFormat, 
                                        TextureDataType.UNSIGNED_BYTE, TextureType.TEXTURE_2D, true, true);  

        const texture = new Texture2D("TransparentTextureTest", glTexture, TextureFiltering.BI_LINEAR, 
                            TextureFiltering.NEAREST); 
        //const texture = new Texture("TransparentTextureTest", glTexture, TextureFiltering.BI_LINEAR, 
        //TextureFiltering.NEAREST, false); 
        
        texture.url = textureURL; 

        material.texture = texture; 
        
        const worldMesh = new WorldMesh("transparentMesh", DrawStaticPrimitiveType.TRIANGLES); 
        worldMesh.material = material; 
        const positionArray = new Float32Array([
            0, 0, 0,
            0, 1, 0,
            1, 0, 0,
            1, 0, 0,
            0, 1, 0,
            1, 1, 0]); 
        
        const glPositionBuffer = new GLArrayBuffer(DrawBufferOptimizationType.STATIC_DRAW, positionArray.length); 
        glPositionBuffer.setAttribPtrData(3, false, 0, 0);
        
        const texCoordsArray = new Float32Array([
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ]);
        
        const glTexBuffer = new GLArrayBuffer(DrawBufferOptimizationType.STATIC_DRAW, texCoordsArray.length); 
        glTexBuffer.setAttribPtrData(2, false, 0, 0);  
        
        // TODO: check with conversion and without, both should work 
        worldMesh.setArrayBufferWithGLUpdate("position", positionArray, glPositionBuffer);
        worldMesh.setArrayBufferWithGLUpdate("texCoord", texCoordsArray, glTexBuffer); 
        
        return worldMesh; 
    }
}