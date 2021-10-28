import { AttribList } from "../materials/GLShader"

export class AttribListCreator {
    private _requirementsToAttribs:Record<string,Record<string,string>>; 

    constructor(requirementsToAttribs:Record<string,Record<string,string>>) {
        this._requirementsToAttribs = requirementsToAttribs;
    }
    

    public getProtoAttribList(requirements:Set<string>):AttribList {
        let attribList:AttribList = {};  

        for(const requirement of requirements) {
            attribList = this._addAttribFields(attribList, requirement); 
        }

        return attribList;
    }
    
    
    private _addAttribFields(attribList:AttribList, requirement: string):AttribList {
        if(!(requirement in this._requirementsToAttribs)) {
            return attribList; 
        }
        
        for(const key in this._requirementsToAttribs[requirement]) {
            const type:string = this._requirementsToAttribs[requirement][key]; 

            attribList[key] = {
                type: type,
                attribLocation: -1
            }
        }

        return attribList; 
    }
}
