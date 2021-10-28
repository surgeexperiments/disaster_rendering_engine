

export class Framebuffer {
    public width:number; 
    public height:number; 

    /* used with gl.renderbufferStorage(). Example: gl.DEPTH_COMPONENT16 */
    public internalFormat:number; 

    public framebuffer:WebGLFramebuffer; 
    public renderbuffer:WebGLRenderbuffer; 

    constructor(width:number, height:number, internalFormat:number) {
        this.width = width; 
        this.height = height; 
        this.internalFormat = internalFormat; 
    }   
}