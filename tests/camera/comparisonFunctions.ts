import { expect } from 'chai'; 

import { Camera3D } from "../../src/camera/camera";
import { compareObjectsJSON } from "../utils/comparisonFunctions"
import { compareNodesJsonifyFields } from "../node/comparisonFunctions"

export function compareCameras(one:Camera3D, two:Camera3D):void {
    compareNodesJsonifyFields(one, two); 
    expect(compareObjectsJSON(one.upVec, two.upVec)).to.equal(true); 
    expect(compareObjectsJSON(one.projectionMatrix, two.projectionMatrix)).to.equal(true); 
}

