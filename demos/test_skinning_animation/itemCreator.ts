import { DrawBufferOptimizationType, DrawStaticPrimitiveType, TextureDataType, TextureFiltering, TexturePixelFormat, TextureType } from "../../src/constants/constants";
import { GLTexture } from "../../src/materials/GLTexture";
import { SkinnedTextureMaterial } from "../../src/materials/SkinnedTextureMaterial";
import { Texture2D } from "../../src/materials/texture2d";
import { TextureMaterial } from "../../src/materials/TextureMaterial";
import { GLArrayBuffer, GLElementBuffer } from "../../src/mesh/GLBuffer";
import { WorldMesh } from "../../src/mesh/WorldMesh";




/* NOTE: this is just a quick hack for testing stuff */
export class ItemCreator {
    /**
     * NOTE: remember to set the scaling on the textureURL properly afterwards so you get the right size. 
     * @param textureURL 
     * @returns 
     */
    public createSkinnedAnimationTextureMesh(textureURL:string, transparent:boolean, texPixelFormat:TexturePixelFormat):WorldMesh {
        const material = new SkinnedTextureMaterial("skinnedTextureMaterial"); 
        //const material = new TextureMaterial("skinnedTextureMaterial"); 
        material.isTransparent = transparent;  
        
        const glTexture = new GLTexture(0, texPixelFormat, texPixelFormat, 
                                        TextureDataType.UNSIGNED_BYTE, TextureType.TEXTURE_2D, true, true);  

        const texture = new Texture2D("TransparentTextureTest", glTexture, TextureFiltering.BI_LINEAR, 
                        TextureFiltering.NEAREST); 
        texture.url = textureURL; 

        material.texture = texture; 
        
        const worldMesh = new WorldMesh("textureMeshNormals", DrawStaticPrimitiveType.TRIANGLES); 
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
        
        const boneWeights = new Float32Array([
            1, 0.5, 0, 0,
            0, 1, 0.5, 0,
            0, 0, 1, 0,
            0, 0, 1, 0,
            0, 1, 0.5, 0,
            0, 0, 1, 0]); 
            
        const boneWeightBuffer = new GLArrayBuffer(DrawBufferOptimizationType.STATIC_DRAW, boneWeights.length); 
        boneWeightBuffer.setAttribPtrData(4, false, 0, 0);

        const boneIndices = new Float32Array([
            0, 1, 2, 3,
            0, 1, 2, 3,
            0, 1, 2, 3,
            0, 1, 2, 3,
            0, 1, 2, 3,
            0, 1, 2, 3]); 
        
        const boneIndexBuffer = new GLArrayBuffer(DrawBufferOptimizationType.STATIC_DRAW, boneIndices.length); 
        boneIndexBuffer.setAttribPtrData(4, false, 0, 0);

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
        worldMesh.setArrayBufferWithGLUpdate("boneWeights", boneWeights, boneWeightBuffer);
        worldMesh.setArrayBufferWithGLUpdate("boneIndices", boneIndices, boneIndexBuffer);
        worldMesh.setArrayBufferWithGLUpdate("texCoord", texCoordsArray, glTexBuffer); 
        
        return worldMesh; 
    }
}