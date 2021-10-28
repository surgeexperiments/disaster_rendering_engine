import materialBasic_fshader from "./shaders/materialBasic_fshader";
import materialBasic_vshader from "./shaders/materialBasic_vshader";
import effect2DBasic_fshader from "./shaders/effect2DBasic_fshader";
import effect2DBasic_vshader from "./shaders/effect2DBasic_vshader";  

import depthBuffer_vShader from "./shaders/depthBuffer_vShader"; 
import depthBuffer_fShader from "./shaders/depthBuffer_fShader"; 

import depthBufferRender_vShader from "./shaders/depthBufferRender_vShader"; 
import depthBufferRender_fShader from "./shaders/depthBufferRender_fShader"; 

export const shaderList = {
    materialBasic_fshader: materialBasic_fshader,
    materialBasic_vshader: materialBasic_vshader,
    effect2DBasic_fshader: effect2DBasic_fshader,
    effect2DBasic_vshader: effect2DBasic_vshader,
    depthBuffer_vShader:depthBuffer_vShader,
    depthBuffer_fShader:depthBuffer_fShader,
    depthBufferRender_vShader:depthBufferRender_vShader,
    depthBufferRender_fShader:depthBufferRender_fShader 
}
