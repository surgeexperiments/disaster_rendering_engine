import { TexturePixelFormat, TextureDataType, TextureType, FramebufferTextureAttachmentPoint } from "../constants/constants"


/**
 * @author SurgeExperiments
 * Contains settings for creating a WebGLTexture. 
 * Settings are stored as enum-values. These must be "mirrored" into their gl-value counterparts by calling setGLValues() before being used with the WebGL API. 
 * 
 * The fields in this class needs to be accessed frequently and perhaps modified (for example when using WebGL2 but the thing is serialized for WebGl1?).
 * Therefore most fields are kept public for now. 
 * 
 * TODO: clean up access to fields IF there is a benefit in the future.
 */
export class GLTexture {
   
   /* Set when setGLValues() and setTexture() r called at least once. A bit cleaner than testing for null or undefined vals. */
   private _glMirrored = false; 
   private _textureSet = false; 
   
   private _texture: WebGLTexture;  
   
   /* Set to false for RenderTextures, else true when this is linked to an image or video */
   public hasData=true;  

   /* A GLint specifying the level of detail. Level 0 is the base image level and level n is the nth mipmap reduction level. */
   public level: number; 

   /* Must be 0 for texImage2D(). Set manually if you need it to be something different */
   public border=0; 

   /* A GLenum specifying the color components in the texture. */
   public internalFormat: TexturePixelFormat;  

   /* A GLenum specifying the format of the texel data. Must equal internalFormat in WebGL1 */
   public format: TexturePixelFormat;

   /* A GLenum specifying the data type of the texel data. */
   public type: TextureDataType; 
   
   /* 2D, 3D or cube texture */
   public target:TextureType;   
   
   /* Some images have an inverted y-axis compared to WebGL. Set this to true to rectify that. */
   public flipYAxis:boolean; 
   
   /* For render textures. Only needed to be set for render textures */
   private _framebufferAttachmentPoint=FramebufferTextureAttachmentPoint.COLOR_ATTACHMENT0; 

   /* The WebGL values corresponding to the enum-typed fields above */
   public glInternalFormat:number; 
   public glFormat:number; 
   public glType:number; 
   public glTarget:number; 
   public glFramebufferAttachmentPoint:number; 

   /* For render texture */
   public width:number; 
   public height: number; 

   constructor(level:number, internalFormat:TexturePixelFormat, format:TexturePixelFormat, type:TextureDataType, target:TextureType, flipYAxis:boolean, hasData:boolean) {
      this.level = level; 
      this.internalFormat = internalFormat;
      this.format = format;
      this.type = type;
      this.target = target; 
      this.flipYAxis = flipYAxis; 
      this.hasData = hasData; 
   }
   
   public set framebufferAttachmentPoint(attachment:FramebufferTextureAttachmentPoint) {
      // TODO: add some err testing?
      this._framebufferAttachmentPoint = attachment; 
   }

   public get framebufferAttachmentPoint():FramebufferTextureAttachmentPoint {
      return this._framebufferAttachmentPoint; 
   }

   public get glMirrored():boolean {
      return this._glMirrored; 
   }
   
   public get textureSet():boolean {
      return this._textureSet; 
   }

   public get fullyInitialized():boolean {
      return this._textureSet && this._glMirrored; 
   }
   

   public set texture(tex:WebGLTexture) {
      this._textureSet = true; 
      this._texture = tex; 
   }

   public get texture():WebGLTexture {
      return this._texture; 
   }
   
   public setWidthHeight(width:number, height:number):void {
      this.width = width; 
      this.height = height; 
   }
   
   public setGLValues(glInternalFormat:number, glFormat:number, glType:number, glTarget:number, glFramebufferAttachmentPoint:number):void {
      this._glMirrored = true; 
      
      this.glInternalFormat = glInternalFormat;
      this.glFormat = glFormat;
      this.glType = glType;
      this.glTarget = glTarget; 
      this.glFramebufferAttachmentPoint = glFramebufferAttachmentPoint; 
   }
   
   
   /** 
    * This will not preserve this.texture or the gl-values. 
    * @returns 
    */
   public jsonify():string {
      const proto:Record<string,unknown>= {}; 
      proto.level = this.level; 
      proto.internalFormat = this.internalFormat; 
      proto.format = this.format; 
      proto.type = this.type; 
      proto.target = this.target; 
      proto.flipYAxis = this.flipYAxis;  
      proto.hasData = this.hasData; 
      
      return JSON.stringify(proto); 
   }
   
   
   public static createFromJSON(json:string):GLTexture {
      const settings = JSON.parse(json); 
      const instance = new GLTexture(settings.level, settings.internalFormat, settings.format, settings.type, settings.target, settings.flipYAxis, settings.hasData); 
      
      return instance; 
   }
}



