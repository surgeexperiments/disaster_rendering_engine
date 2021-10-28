/* Need to pre-process the shaders and add in all #includes <?> and a shaderDefines struct. The GLSL pre-processor handles the rest. 
- When the shader includes are processed the uniform-groups that they have are automatically included 

*/


/**
 * The world's simplest preprocessor! It only need to recursively replace #include <*> with some text and add some defines. 
 */
export class ShaderPreprocessing {
    private _requirementsToDefines:Record<string,string>; 
    private _shaderIncludes:Record<string,string>; 

    constructor(requirementsToDefines:Record<string,string>, shaderIncludes:Record<string,string>) {
        // TODO: move to some data-file for shader preprocessing 
        this._requirementsToDefines = requirementsToDefines; 
        this._shaderIncludes = shaderIncludes; 
    }
    
    public constructShader(shaderSource:string, requirements:Set<string>):string {
        let constructedShader = this._createDefines(requirements);
        constructedShader += "\n";
        constructedShader += this._addIncludes(shaderSource); 

        return constructedShader; 
    }
    
    /**
     * 
     * @param requirements Set of requirements from a Material 
     */
    private _createDefines(requirements:Set<string>):string {
        let retVal = ""; 
        
        for(const requirement of requirements) {
            if(requirement in this._requirementsToDefines) {
                retVal += this._requirementsToDefines[requirement] + "\n"; 
            }
        }
        return retVal; 
    }
    
    /**
     * TODO: profile this, it could probably be speeded up! But is it needed? 
     * TODO: return the names of all replaced modules? (for attrib and uniform matching)
     * @param shaderSource 
     * @param shaderFragments 
     * @returns 
     */
    private _addIncludes(shaderSource:string):string {

        /* Allow 0 or 1 space after include. Include names must be at least one character (lol). 
         * The group is the name of the include. 
         */
        const regex = /#include\s?<([^>]+)>/;

        let regexMatch = regex.exec(shaderSource); 
        
        while(regexMatch !== null) { 
            /* We want to replace group two, which is between group 1 and 3 (:p). TODO: check if you can replace group 2 directly */
            const regexReplace = this._shaderIncludes[regexMatch[1]]; 

            shaderSource = shaderSource.replace(regex, regexReplace); 

            regexMatch = regex.exec(shaderSource);
        }

        return shaderSource; 
    }
}


