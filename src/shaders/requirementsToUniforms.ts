// TODO: rename file haha

export const requirementsToUniforms = {
    /* TODO: rename to something more specific. Effect2D ect should not have the view projection matrix */
    basic: { 
        modelViewProjectionMatrix: "mat4"
    },
    color: {
        color: "vec4"
    }, 
    depthBuffer: {
        modelViewProjectionMatrix: "mat4"
    },
    // TODO: this is still custom 
    depthTextureRender: {
        modelViewProjectionMatrix: "mat4",
        texture: "sampler2D" 
    },
    texture: {
        texture: "sampler2D" 
    },
    texture2D: {
        texture: "sampler2D" 
    },
}


export const requirementsToAttributes = {
    basic: {
        position: "vec3"
    },
    basicEffect2D: {
        position: "vec3"
    },
    colorBuffer: {
        colorBuffer: "vec4"
    }, 
    depthBuffer: {
        position: "vec3"
    },
    depthTextureRender: {
        position: "vec3",
        texCoord: "vec2"
    },
    texture: {
        texCoord: "vec2"
    },
    texture2D: {
        texCoord: "vec2"
    }
}