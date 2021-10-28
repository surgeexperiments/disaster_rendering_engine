import { UniformList } from "../materials/GLShader"

export class UniformListCreator {
    private _requirementsToUniforms:Record<string,Record<string,string>>; 

    constructor(requirementsToUniforms:Record<string,Record<string,string>>) {
        this._requirementsToUniforms = requirementsToUniforms;
    }
    

    public getProtoUniformList(requirements:Set<string>):UniformList {
        let uniformList:UniformList = {};  

        for(const requirement of requirements) {
            uniformList = this._addUniformFields(uniformList, requirement); 
        }

        return uniformList;
    }
    

    private _addUniformFields(uniformList:UniformList, requirement: string):UniformList {
        if(!(requirement in this._requirementsToUniforms)) {
            return uniformList; 
        }
        
        for(const key in this._requirementsToUniforms[requirement]) {
            const type:string = this._requirementsToUniforms[requirement][key]; 

            uniformList[key] = {
                type: type,
                uniformLocation: -1,
                update: true,
                value: null
            }
        }

        return uniformList; 
    }
}

