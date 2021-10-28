import { expect } from 'chai'; 
import { vec3 } from "../../src/math/gl-matrix" 
import { Node } from "../../src/node/node";

/**
 * Check if the arrays contains the exact same instances using the simplest technique there is.
 * The Nodes can be in different order in the two arrays, but they have to be unique. No duplicates.
 * 
 * TODO: There is probably a better way of doing this.
 * 
 * @param one 
 * @param two 
 * @returns 
 */
export function compareNodeArrays(one:unknown[], two:unknown[]):boolean {
    if(one.length !== two.length) {return false;}

    /* If every reference in one is found in two and they have the same size, they are equal */
    for(let i=0; i<one.length; ++i) {
        const index:number = two.indexOf(one[i]);
        if(index<0) {return false;}
    }

    return true; 
}


/**
 * Only compare the fields that get set by Node.jsonify(). 
 * @param one 
 * @param two 
 */
export function compareNodesJsonifyFields(one:Node, two:Node):void {
        expect(one.name).to.equal(two.name); 
        expect(one.uuid).to.equal(two.uuid); 
        expect(one.render).to.equal(two.render); 
        expect(one.isGroupContainer).to.equal(two.isGroupContainer); 
        expect(one.subtreeDeactivated).to.equal(two.subtreeDeactivated); 
        expect(one.frustrumCull).to.equal(two.frustrumCull); 
        
        expect(one.quaternion).to.equal(two.quaternion); 
        expect(one.rotateX).to.equal(two.rotateX); 
        expect(one.rotateY).to.equal(two.rotateY); 
        expect(one.rotateZ).to.equal(two.rotateZ); 

        expect(one.useLookAt).to.equal(two.useLookAt); 
         
        expect(one.translateX).to.equal(two.translateX); 
        expect(one.translateY).to.equal(two.translateY);
        expect(one.translateZ).to.equal(two.translateZ);
        
        expect(vec3.equals(one.scale, two.scale)).to.equal(true); 
}




