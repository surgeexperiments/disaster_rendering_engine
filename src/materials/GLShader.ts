import { deepCopyObject } from "../utils/deepCopy"

export interface UniformList {
    [name: string]: {
        type: string,
        uniformLocation: WebGLUniformLocation,
        /* Optional: Flag that tells if the uniform needs to be updated for a given frame. Initialized to true as uniforms must always be set initially. 
         * Caution: If multiple Material instances share the same shader and use different uniform values, they might change values so they must be 
         *          changed back for a later material, even if the update flag is not set. 
         *          TODO: is it worth making a system for tracking uniform changes? profile that very carefully ROFL
         */
        update:boolean,
        value:unknown
    } 
}

export interface AttribList {
    [name: string]: {
        type: string,
        attribLocation: number
    } 
}


/**
 * @author SurgeExperiments
 * 
 * UPDATING UNIFORMS: 
 *      Whenever an item must must have a uniform updated before it is drawn in the renderer (time passed, WorldMatrix ect): 
 *      the value must be set in the associated GLShader instance with setUniformValue(). 
 *      This will set the update-flag and LayerShader will update the uniforms before rendering the item.
 * 
 *      Remember to set all uniforms during the first render pass :D 
 * 
 * Shader creation and access is strictly controlled by WebGLLayer and ShaderCreator. Therefore this class does not allow modification of 
 * the shader program and other private fields, even when cloning. 
 * Only the values of the uniforms are allowed to change. 
 * This means that a material instance having an instance of a GLShader that represents a specific shader can upload its own uniforms 
 * to the shader, but it can't modify anything else about what is sent to the shader. 
 * 
 * Note: TODO: get uniforms() and get attribs() makes it possible to modify some of the "locked data" because they return references. 
 *       They are here for testing and engine only. 
 * 
 * TODO: Test the speed of letting the renderer get a reference of _uniforms to copying the data to prevent any ability to 
 *       modify the uniformList. 
 */
export class GLShader {
    private _uuid: string; 
    private _program: WebGLProgram; 
    private _uniforms: UniformList; 
    private _attribs: AttribList; 

    /* Not serialized. Set live for sorting purposes. */
    public id:number; 

    /** 
     * 
     * @param uuid 
     * @param program 
     * @param uniforms Will often come from a standard-list of uniforms. The object will be cloned to avoid modifying a reference that can be used elsewhere.  
     * @param attribs This will be cloned to avoid modifying a reference that can be used elsewhere. 
     */
    constructor(uuid:string, program:WebGLProgram, uniforms:UniformList, attribs:AttribList, id?:number) {
        this._uuid = uuid; 
        this._program = program; 
        this._uniforms = this._copyUniformList(uniforms); 
        this._attribs = deepCopyObject(attribs) as AttribList;

        if(id !== undefined) {
            this.id = id;
        } else {
            this.id = -1; 
        }
    }

    public get uuid():string {
        return this._uuid; 
    }

    public get program():WebGLProgram {
        return this._program; 
    }
    
    /* Reserved for LayerShader. Use setUniformValue() for modifying uniforms! */
    public get uniforms():UniformList {
        return this._uniforms; 
    }

    /* Only for testing */
    public get attribs():AttribList {
        return this._attribs; 
    }
    
    /* We want a deep copy of the uniform-list except for the WebGLUniformLocation field that must be the same reference as the orignial */
    private _copyUniformList(uniformList:UniformList):UniformList {
        // TODO: deeoCopyObject doesn't work for WebGLUniformLocation, which should be referenced. 
        const uniforms:UniformList = deepCopyObject(uniformList) as UniformList; 
        for(const key in uniformList) {
            uniforms[key].uniformLocation = uniformList[key].uniformLocation; 
        }
        return uniforms; 
    }
    
    // TODO: remove auto-setting of .update to true?
    public setUniformValue(name:string, value:unknown):void {
        if(name in this._uniforms) {
            this._uniforms[name].update = true; 
            this._uniforms[name].value = value; 
        } else {
            // TODO: throw error? Or just ignore? 
        }
    }
    
    public deactivateUniformUpdate(name:string) {
        if(name in this._uniforms) {
            this._uniforms[name].update = false; 
        } 
    }

    public activateUniformUpdate(name:string) {
        if(name in this._uniforms) {
            this._uniforms[name].update = true; 
        } 
    }

    public getUniformValue(name:string):unknown|null {
        if(name in this._uniforms) {
            return this._uniforms[name].value; 
        }
        return null; 
    }

    public setAllUniformUpdateFalse():void {
        for(const key in this._uniforms) {
            this._uniforms[key].update = false; 
        }
    }

    public setAllUniformUpdateTrue():void {
        for(const key in this._uniforms) {
            this._uniforms[key].update = true; 
        }
    }

    // https://stackoverflow.com/questions/64207312/time-complexity-to-check-if-a-key-exists-in-an-object-using-in-property
    public getAttribLocation(name:string):number | null {
        if(name in this._attribs) {
            return this._attribs[name].attribLocation; 
        }
        return null; 
    }
    
    public getUniformLocation(name:string): WebGLUniformLocation | null {
        if(name in this._uniforms) {
            return this._uniforms[name].uniformLocation; 
        }
        return null; 
    }

    /**
     * Many Material-instances might need the same shader, but 
     * they still need to set their own uniforms. 
     * For that, just clone an existing shader. 
     */
    public clone():GLShader {
        /* The constructor will clone the uniforms and attribs */
        return new GLShader(this.uuid, this.program, this._uniforms, this._attribs, this.id); 
    }
}

