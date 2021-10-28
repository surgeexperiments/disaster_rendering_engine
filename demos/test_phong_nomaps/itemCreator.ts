import { DrawBufferOptimizationType, DrawStaticPrimitiveType, TextureDataType, TextureFiltering, TexturePixelFormat, TextureType } from "../../src/constants/constants";
import { ColorMaterial } from "../../src/materials/colorMaterial";
import { DepthTextureRenderMaterial } from "../../src/materials/depthTextureRenderMaterial";
import { GLTexture } from "../../src/materials/GLTexture";
import { PhongMaterialBasic } from "../../src/materials/phongMaterialBasic";
import { Texture2D } from "../../src/materials/texture2d";
import { GLArrayBuffer, GLElementBuffer } from "../../src/mesh/GLBuffer";
import { WorldMesh } from "../../src/mesh/WorldMesh";


/* NOTE: this is just a quick hack for testing stuff */
export class ItemCreator {
    public createColoredWorldMeshWithNormals(buffers:Record<string,unknown>, name:string, color:Float32Array, drawStaticPrimitiveType:DrawStaticPrimitiveType, drawBufferOptimizationType:DrawBufferOptimizationType):WorldMesh {
        const material = new ColorMaterial(name); 
        material.color = color; 
        
        const worldMesh = new WorldMesh(name, drawStaticPrimitiveType); 
        worldMesh.material = material; 
        const glPositionBuffer = new GLArrayBuffer(drawBufferOptimizationType, (buffers.position as Float32Array).length); 
        glPositionBuffer.setAttribPtrData(3, false, 0, 0);
        
        const glNormalBuffer = new GLArrayBuffer(drawBufferOptimizationType, (buffers.normal as Float32Array).length); 
        glNormalBuffer.setAttribPtrData(3, false, 0, 0);

        const glIndicesBuffer = new GLElementBuffer(drawBufferOptimizationType, (buffers.indices as Uint16Array).length);
        
        // TODO: check with conversion and without, both should work 
        worldMesh.setArrayBufferWithGLUpdate("position", Array.from(buffers.position as Float32Array), glPositionBuffer);
        worldMesh.setArrayBufferWithGLUpdate("normal", Array.from(buffers.normal as Float32Array), glNormalBuffer);
        worldMesh.setIndexBufferWithGLUpdate(Array.from(buffers.indices as Uint16Array), glIndicesBuffer); 
        return worldMesh; 
    }
    
    /**
     * NOTE: remember to set the scaling on the textureURL properly afterwards so you get the right size. 
     * @param textureURL 
     * @returns 
     */
    public createTextureMeshWithNormals(textureURL:string, transparent:boolean, texPixelFormat:TexturePixelFormat):WorldMesh {
        //const material = new Material("texMaterial"); 
        //material.addRequirement("texture");
        const material = new PhongMaterialBasic("phongBasicTexture", true); 
        material.isTransparent = transparent;  
        
        //const glTexture = new GLTexture(0, TexturePixelFormat.RGBA, TexturePixelFormat.RGBA, 
        //    TextureDataType.UNSIGNED_BYTE, TextureType.TEXTURE_2D, true);  
        
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
        
        /* it's a simple plane so all normals are oriented the same way lol */
        const normalArray = new Float32Array([
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1]); 

        const glNormalBuffer = new GLArrayBuffer(DrawBufferOptimizationType.STATIC_DRAW, normalArray.length); 
        glNormalBuffer.setAttribPtrData(3, false, 0, 0);

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
        worldMesh.setArrayBufferWithGLUpdate("normal", normalArray, glNormalBuffer);
        worldMesh.setArrayBufferWithGLUpdate("texCoord", texCoordsArray, glTexBuffer); 
        
        return worldMesh; 
    }

    // Quick hack, you got to set the texture later after install 
    public createDepthTextureDisplayMesh():WorldMesh {
        //const material = new Material("texMaterial"); 
        //material.addRequirement("texture");
        const material = new DepthTextureRenderMaterial("depthTextureRenderMaterial"); 
        //const material = new ColorMaterial("depthTextureRenderMaterial"); 
        //material.color = new Float32Array([100.0, 100.0, 100.0]); 
        material.isTransparent = false;  
        
        const worldMesh = new WorldMesh("depthTextureDisplayMesh", DrawStaticPrimitiveType.TRIANGLES); 
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

    public createBasicPhongMesh(buffers:Record<string,unknown>, name:string, useTexture:boolean, drawStaticPrimitiveType:DrawStaticPrimitiveType, drawBufferOptimizationType:DrawBufferOptimizationType):WorldMesh {
        const material = new PhongMaterialBasic(name, useTexture); 
        
        const worldMesh = new WorldMesh(name, drawStaticPrimitiveType); 
        worldMesh.material = material; 
        const glPositionBuffer = new GLArrayBuffer(drawBufferOptimizationType, (buffers.position as Float32Array).length); 
        glPositionBuffer.setAttribPtrData(3, false, 0, 0);
        
        const glNormalBuffer = new GLArrayBuffer(drawBufferOptimizationType, (buffers.normal as Float32Array).length); 
        glNormalBuffer.setAttribPtrData(3, false, 0, 0);
        
        const glIndicesBuffer = new GLElementBuffer(drawBufferOptimizationType, (buffers.indices as Uint16Array).length);
        
        // TODO: check with conversion and without, both should work 
        worldMesh.setArrayBufferWithGLUpdate("position", Array.from(buffers.position as Float32Array), glPositionBuffer);
        worldMesh.setArrayBufferWithGLUpdate("normal", Array.from(buffers.normal as Float32Array), glNormalBuffer);
        worldMesh.setIndexBufferWithGLUpdate(Array.from(buffers.indices as Uint16Array), glIndicesBuffer); 
        return worldMesh; 
    }

    public createBasicPhongMeshColor(buffers:Record<string,unknown>, name:string, color:Float32Array, drawStaticPrimitiveType:DrawStaticPrimitiveType, drawBufferOptimizationType:DrawBufferOptimizationType):WorldMesh {
        const worldMesh:WorldMesh = this.createBasicPhongMesh(buffers, name, false, drawStaticPrimitiveType, drawBufferOptimizationType); 
        worldMesh.material.setSurfaceAttribute("color", color); 

        return worldMesh; 
    }
    
    public createBasicPhongMeshTexture(buffers:Record<string,unknown>, name:string, drawStaticPrimitiveType:DrawStaticPrimitiveType, drawBufferOptimizationType:DrawBufferOptimizationType):WorldMesh {
        const worldMesh:WorldMesh = this.createBasicPhongMesh(buffers, name, true, drawStaticPrimitiveType, drawBufferOptimizationType); 
        
        const gltextureBuffer = new GLArrayBuffer(drawBufferOptimizationType, (buffers.texCoord as Float32Array).length); 
        gltextureBuffer.setAttribPtrData(2, false, 0, 0);

        return worldMesh; 
    }
}

