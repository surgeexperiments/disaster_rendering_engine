import { WebGLRenderingContext } from "../d.ts/WebGLContext";

export interface contextLostCallback { (errMsg:string): void }

/**
 * Class that handles basic canvas tasks. 
 * 
 * @author SurgeExperiments
 * 
 * NOTE: 
 * - HTML width and heigth sets the size of the drawing buffer, while the CSS width and height 
 *        sets the actual size the canvas is displayed at on the web page. 
 * 
 * canvas.clientHeight/width are the size of the elements in css pixels (they include padding)
 * gl.viewPort() tells how to go from clip space to pixels on the canvas. 
 * : Call this after a resize event to avoid stuff being drawn wrong to the canvas.
 * 
 * CSS pixels can look different on different monitors.
 * window.devicePixelRatio tells the ratio between CSS pixels and monitor pixels. 
 * 
 * TODO: 
 * - Add proper error handling when loading the canvas and the context in loadAssets()
 * - Also add multiple attempts: Trying to load all the capabilities the platform supports. 
 */
 export class LayerCanvas {

    public canvas: HTMLCanvasElement | null; 
    public gl: WebGLRenderingContext; 
    public canvasID: string; 
    
    constructor(canvasID:string) {
        this.canvasID = canvasID;
    }
    
    get width():number {
        if(this.canvas) {
            return this.canvas.width; 
            //return this.canvas.width; 
        }
        return -1; 
    }

    /* The actual width of the canvas on the page, controlled by CSS*/
    get clientWidth():number {
        if(this.canvas) {
            return this.canvas.clientWidth; 
            //return this.canvas.width; 
        }
        return -1; 
    }

    get height():number {
        if(this.canvas) { 
            return this.canvas.clientHeight; 
            //return this.canvas.height; 
        }
        return -1; 
    }
    
    /* The actual width of the canvas on the page, controlled by CSS*/
    get clientHeight():number {
        if(this.canvas) {
            return this.canvas.clientHeight; 
            //return this.canvas.width; 
        }
        return -1; 
    }

    loadAssets():boolean {
        try {
            this.canvas = this.getCanvas(this.canvasID); 
            this.gl = this.getContext(this.canvas); 
        } catch (e) {
            alert("Could not load canvas assets. Error: " + e.message);
            return false; 
        }
        
        return true; 
    }

    /* Use this if you already have these variables */
    setAssets(canvas:HTMLCanvasElement, gl:WebGLRenderingContext):void {
        this.canvas = canvas; 
        this.gl = gl; 
    }
     
    getCanvas(canvasID:string):HTMLCanvasElement {
        return document.getElementById(canvasID) as HTMLCanvasElement;  
    }

    /**
     * @brief NOTE: call AFTER getCanvas()! 
     *        TODO: Add the ability to try multiple gl context strings like webgl2, passed as an array
     *        TODO: add some throwing of errors 
     */
    getContext(canvas:HTMLCanvasElement):WebGLRenderingContext {
        // webgl2 doesn't work in the VM 
        const gl:unknown = canvas.getContext('webgl'); 
        if(gl===null) {
            throw new Error("getContext(): could not fetch canvas"); 
        }

        const context = gl as WebGLRenderingContext; 
        context.viewport(0, 0, canvas.width, canvas.height); 
        /* Color canvas black */
        context.clearColor(0.0, 0.0, 0.0, 1.0); 
        context.clear(context.COLOR_BUFFER_BIT); 

        return context; 
    }

    returnCanvas():HTMLCanvasElement {
        return this.canvas as HTMLCanvasElement; 
    }

    returnContext():WebGLRenderingContext {
        return this.gl; 
    }

    setOnContextLostHandler(callback:contextLostCallback):void {
        //this.canvas.addEventListener('onContextLost', callback); 
        console.log("lol"); 
    }

    disableAlphaBlend():void {
        this.gl.disable(this.gl.BLEND);
    }

    /**
     * TODO: Make this parameterized or something. Can't just have gl.ONE_MINUS_SRC_ALPHA. 
     */
    enableAlphaBlend():void {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    public enableDepthTest():void {
        this.gl.enable(this.gl.DEPTH_TEST); 
    }

    public disableDepthTest():void {
        this.gl.disable(this.gl.DEPTH_TEST); 
    }

    /**
     * Make depth-buffer writeable
     */
    public enableDepthWriting():void {
        this.gl.depthMask(true); 
    }

    /**
     * Make depth-buffer read-only (useful for rendering transparent objects) 
     */
    public disableDepthWriting():void {
        this.gl.depthMask(false); 
    }

    clearCanvas2D(r:number, g:number, b:number, a:number):void {
        const gl:WebGLRenderingContext = this.gl; 

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // These can screw with 2d image processing 
        gl.enable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST); 
    }

    // TODO: remove 
    clearCanvas3D(r:number, g:number, b:number, a:number):void {

        const gl:WebGLRenderingContext = this.gl; 

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // These can screw with 2d image processing 
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST); 
    }

    clearCanvas(r:number, g:number, b:number, a:number):void {
        //this.resizeCanvasToDisplaySize(1);
        
        const gl:WebGLRenderingContext = this.gl; 

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    clearCanvasColor(r:number, g:number, b:number, a:number):void {
        const gl:WebGLRenderingContext = this.gl; 
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    clearCanvasDepthBuffer():void {
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
    }

    clearCanvasColorBuffer():void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    getCanvasAspect():number {
        if( this.gl.canvas.clientHeight == 0) {
            return 0; 
        }
        return this.gl.canvas.clientWidth / this.gl.canvas.clientHeight; 
    }

   /** 
    * Resize a canvas to match the size its displayed.
    * Borrowed from webgl utils
    * 
    * @param {HTMLCanvasElement} canvas The canvas to resize.
    * @param {number} [multiplier] amount to multiply by.
    *    Pass in window.devicePixelRatio for native pixels.
    * @return {boolean} true if the canvas was resized.
    * @memberOf module:webgl-utils
    */
   public resizeCanvasToDisplaySize(multiplier?:number):boolean {
    multiplier = multiplier || 1;
    if(this.canvas) {
        const canvas:HTMLCanvasElement = this.canvas; 
        const width:number  = canvas.clientWidth  * multiplier | 0;
        const height:number = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width ||  canvas.height !== height) {
            canvas.width  = width;
            canvas.height = height;
            return true;
        }

        return false;
    }

    return false; 
  }
}





