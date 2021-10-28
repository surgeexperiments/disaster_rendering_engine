
/* 
We need to share constants like gl-draw-mode without having to throw the gl context variable around. 

Info taken from 
- learnopengl.com
*/


/**
 * for framebufferTexture2D(): param attachment. Options for WebGL1 
 * TODO: add options for WebGL2 
 * > https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferTexture2D
 */
export enum FramebufferTextureAttachmentPoint {
    COLOR_ATTACHMENT0, /* Attaches the texture to the framebuffer's color buffer. */
    DEPTH_ATTACHMENT,  /* Attaches the texture to the framebuffer's depth buffer. */
    STENCIL_ATTACHMENT /* Attaches the texture to the framebuffer's stencil buffer */
}


/** 
 * For buffers we can set the intended usage pattern for optimization purposes. gl.STATIC_DRAW ect. 
 * They are not hard rules but hints to the driver so it can set things up efficiently. 
 * https://www.reddit.com/r/opengl/comments/57i9cl/examples_of_when_to_use_gl_dynamic_draw/
 */
export enum DrawBufferOptimizationType {
    /* When you want to modify vertex data almost every frame. The data is modified on the CPU. An alternative to static data + shader manipulation
     * that is usually slower, but can enable things shaders can't do. 
     */
    STREAM_DRAW,
    /* The data store contents will be modified once and used many times. Static elements and elements animated in the vertex shader (like skeletal animation) */
	STATIC_DRAW,
    /* Buffer data will be modified but not every frame. Probably not that useful for animation (use STREAM_DRAW instead), but can work for slow changes */
	DYNAMIC_DRAW
}

/**
 * Which primitive to draw. This equals the mode param in drawArrays and drawElements. 
 */
export enum DrawStaticPrimitiveType {
    POINTS,
	LINES,
	LINE_LOOP,
	LINE_STRIP,
	TRIANGLES,
	TRIANGLE_STRIP,
	TRIANGLE_FAN
}

export enum DrawBufferArrayType {
    ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER,

    /* Additional options for WebGL2 */

    /* Buffer for copying from one buffer object to another.*/
    COPY_READ_BUFFER,
    /* Buffer for transform feedback operations. */
    TRANSFORM_FEEDBACK_BUFFER, 
    /* Buffer used for storing uniform blocks.*/
    UNIFORM_BUFFER,
    /* Buffer used for pixel transfer operations. */
    PIXEL_PACK_BUFFER,
    /* Buffer used for pixel transfer operations. */
    PIXEL_UNPACK_BUFFER
}

export enum TextureWrapping {
    /* WebGL default value. Repeats the texture image when tex params go outside [0,1] Equals using the fractional part of the param */
    REPEAT,
    /* Like TEXTURE_WRAPPING_REPEAT except the texture is mirrored every other repetition */
    MIRRORERD_REPEAT,
    /* Clamps coordinates between 0 and 1. Results in higher coordinates become clamped to the edge, giving a stretched edge pattern */
    CLAMP_EDGE,
    /* Coordinates outside the range are given a user-specific border color 
     * glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, borderColor)
     * Unsupported in WebGL 
     */
    //CLAMP_BORDER
}

export enum TextureFiltering {
    NEAREST,
    BI_LINEAR 
}

export enum TextureMipmapFiltering {
    NEAREST_MIPMAP_NEAREST,
    LINEAR_MIPMAP_NEAREST,
    NEAREST_MIPMAP_LINEAR,
    LINEAR_MIPMAP_LINEAR
}

/* Info abt texture data formats and data types here 
https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
*/

export enum TexturePixelFormat {
    RGBA,
    RGB,
    LUMINANCE_ALPHA,
    LUMINANCE,
    ALPHA,
    /* NOTE: In WebGL1 */
    DEPTH_COMPONENT
}


/* Data type of the texel data */
export enum TextureDataType {
    /* 8 bits per channel for gl.RGBA */
    UNSIGNED_BYTE,
    /* WEBGL_depth_texture extension or WebGL2*/
    UNSIGNED_SHORT,
    UNSIGNED_INT,
    /* WebGL OES_texture_float extension or WebGL2 */
    FLOAT,
    /* WebGL 2*/
    BYTE, 
    SHORT
}

export enum TextureType {
    TEXTURE_2D,
    TEXTURE_3D,
    TEXTURE_CUBE_MAP
}

export enum DrawMode {
    TRIANGLES,
    LINES,
    POINTS
}
