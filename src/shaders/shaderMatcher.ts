

/**
 * Matches a shader in ./src/shaders/shaders to requirements 
 */
export class ShaderMatcher {
    private _shaders:Record<string,string>; 

    constructor(shaders:Record<string,string>) {
        this._shaders = shaders; 
    }

    getVertexShader(requirements:Set<string>):string {
        if(requirements.has("texture2D")) {
            return this._shaders.effect2DBasic_vshader; 
        } else if (requirements.has("depthBuffer")) {
            return this._shaders.depthBuffer_vShader; 
        } else if (requirements.has("depthTextureRender")) {
            return this._shaders.depthBufferRender_vShader; 
        } else {
            return this._shaders.materialBasic_vshader; 
        }
    }
    
    getFragmentShader(requirements:Set<string>):string {
        if(requirements.has("texture2D")) {
            return this._shaders.effect2DBasic_fshader; 
        } else if (requirements.has("depthBuffer")) {
            return this._shaders.depthBuffer_fShader; 
        } else if (requirements.has("depthTextureRender")) {
            return this._shaders.depthBufferRender_fShader; 
        } else {
            return this._shaders.materialBasic_fshader; 
        }
    }
}