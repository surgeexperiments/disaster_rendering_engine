import {UniformList, AttribList} from "../materials/GLShader"

import { WebGLRenderingContext } from "../d.ts/WebGLContext";

/** 
 * @author SurgeExperiments 
 * RENAME
 * NOTE: for arrays in the shader like u_kernel[9]: pass the name u_kernel[0] as this makes getUniformLocation find it. 
 *       To make this work, you must pass it in this way: 'uMyArray[0]': 'name' as js will interpret uMyArray[0] as an arr. 
 * : use gl.FLOAT, gl.FLOAT_VEC3 ect instead? Seems to conform more to the standard. 
*/
export class LayerShader {
    public gl:WebGLRenderingContext;
    
    constructor(gl:WebGLRenderingContext) {
        this.gl = gl; 
    }
    
    /**
     * @param glShaderType Either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @param source a string with the source code for the shader
     * @returns WebGLShader or null on error 
     */
    private _compileShader(glShaderType:number, source:string):WebGLShader|null {
        const shader:WebGLShader = this.gl.createShader(glShaderType) as WebGLShader; 
        this.gl.shaderSource(shader, source); 
        this.gl.compileShader(shader); 

        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader)); 
            console.log(source);
            this.gl.deleteShader(shader); 
            return null; 
        }

        return shader; 
    }
    
    
    /**
     * Get references to a set of uniforms in the linked shaders 
     * @param {*} protoUniformList A that only contains names and types. 
     */
    loadUniforms(shaderRef:WebGLShader, protoUniformList:UniformList):UniformList {
        for (const name in protoUniformList) {
            protoUniformList[name]['uniformLocation'] = this.gl.getUniformLocation(shaderRef, name) as WebGLUniformLocation; 
        }

        return protoUniformList;
    }
    
    /**
     * 
     * @param shaderRef 
     * @param protoAttribList An AttribList that only contains names and types. 
     * @returns 
     */
    loadAttribs(shaderRef:WebGLShader, protoAttribList:AttribList):AttribList {
        for (const name in protoAttribList) {
            protoAttribList[name]['attribLocation'] = this.gl.getAttribLocation(shaderRef, name); 
        }

        return protoAttribList; 
    }
    

    /**
     * @param {*} vertexSource 
     * @param {*} fragmentSource 
     */
    createShader(vertexSource:string, fragmentSource:string): WebGLProgram | null {
        const vertexProg: WebGLShader|null = this._compileShader(this.gl.VERTEX_SHADER, vertexSource); 
        const fragmentProg: WebGLShader|null = this._compileShader(this.gl.FRAGMENT_SHADER, fragmentSource); 
        
        // TODO: verify that null is returned (pretty sure lol) 
        if(vertexProg === null || fragmentProg === null) { 
            return null;  
        }

        // TODO: use the d.ts file?     
        /* If this fails and null is returned the LINK_STATUS will catch it below */
        const shaderProg: WebGLProgram = this.gl.createProgram() as WebGLProgram; 
        
        this.gl.attachShader(shaderProg, vertexProg);
        this.gl.attachShader(shaderProg, fragmentProg); 
        this.gl.linkProgram(shaderProg);
        
        if (!this.gl.getProgramParameter(shaderProg, this.gl.LINK_STATUS)) {
            return null;  
        }  

        /* No longer needed as they are linked */
        this.gl.deleteShader(vertexProg); 
        this.gl.deleteShader(fragmentProg); 

        return shaderProg; 
    }


    /**
     * @brief All values are arrays from gl-matrix 
     * @param {*} name 
     * @param {*} value 
     */
    setUniform(uniform:WebGLUniformLocation, uniformType:string, value:unknown):void {
        if(uniformType == "mat4") {
            this.gl.uniformMatrix4fv(uniform, false, value as Float32Array);
        } else if(uniformType == "float") {
            this.gl.uniform1f(uniform, value as number); 
        } else if (uniformType == "float[]") {
            this.gl.uniform1fv(uniform, value as number[]);
        } else if (uniformType== "sampler2D") {
            this.gl.uniform1i(uniform, value as number); 
        } else if (uniformType == "vec2") {
            this.gl.uniform2f(uniform, (value as number[])[0], (value as number[])[1]);
        } else if (uniformType == "vec3") {
            this.gl.uniform3f(uniform, (value as number[])[0], (value as number[])[1], (value as number[])[2]);
        } else if (uniformType == "vec4") {
            this.gl.uniform4f(uniform, (value as number[])[0], (value as number[])[1], (value as number[])[2], (value as number[])[3]);
        } else if (uniformType == "int") {
            this.gl.uniform1i(uniform, value as number); 
        } else if (uniformType == "bool") {
            this.gl.uniform1i(uniform, value as number); 
        } 
         else {
            alert("shader: unsupported uniform type: "); 
        }
    }
    
    setUniforms(uniformList:UniformList):void {
        for(const key in uniformList) {
            if(uniformList[key].update) {
                this.setUniform(uniformList[key].uniformLocation, uniformList[key].type, uniformList[key].value); 
            }
        }
    }

    use(shaderProg:WebGLProgram):void {
        this.gl.useProgram(shaderProg); 
    }

    delete(shaderProg:WebGLProgram):void {
        this.gl.deleteShader(shaderProg);
    }
}