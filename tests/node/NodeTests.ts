import { expect } from 'chai'; 
import { mat4, vec3 } from "../../src/math/gl-matrix" 

import { Node } from "../../src/node/node";
import { compareObjectsJSON } from "../utils/comparisonFunctions";
import { compareNodeArrays, compareNodesJsonifyFields } from "./comparisonFunctions";



describe('Node tests', () => {
    const name = "testNode"; 
    const uuid = "testNode1UUID"; 
    const node = new Node(name, uuid); 

    it('default options', () => {
        expect(node.name).to.equal(name); 
        expect(node.uuid).to.equal(uuid); 
        expect(node.render).to.equal(true); 
        expect(node.isGroupContainer).to.equal(false); 
        expect(node.subtreeDeactivated).to.equal(false); 
        expect(node.frustrumCull).to.equal(true); 

        /* mat4.create() creates an identity-matrix */
        expect(mat4.equals(node.localMatrix, mat4.create())).to.equal(true); 
        expect(mat4.equals(node.worldMatrix, mat4.create())).to.equal(true); 

        expect(node.childNodes.length).to.equal(0); 
        expect(node.parent).to.equal(null); 

        expect(node.quaternion).to.equal(null); 
        expect(node.rotateX).to.equal(0); 
        expect(node.rotateY).to.equal(0); 
        expect(node.rotateZ).to.equal(0); 
        
        expect(node.translateX).to.equal(0); 
        expect(node.translateY).to.equal(0);
        expect(node.translateZ).to.equal(0);
        
        expect(vec3.equals(node.scale, vec3.fromValues(1, 1, 1))).to.equal(true); 
    }); 
    
    
    it('set/addTranslation()', () => {
        node.setTranslation(100, 200, 300); 
        node.addTranslation(1, 2, 3); 
        expect(node.translateX).to.equal(101); 
        expect(node.translateY).to.equal(202); 
        expect(node.translateZ).to.equal(303); 
    }); 
    
    it('set/addScaling()', () => {
        node.setScaling(400, 500, 600); 
        node.addScaling(4, 5, 6); 
        expect(node.scale[0]).to.equal(404); 
        expect(node.scale[1]).to.equal(505); 
        expect(node.scale[2]).to.equal(606); 
    }); 
    
    it('set/addRotation()', () => {
        node.setRotation(700, 800, 900); 
        node.addRotationX(7); 
        node.addRotationY(8); 
        node.addRotationZ(9); 
        
        expect(node.rotateX).to.equal(707); 
        expect(node.rotateY).to.equal(808); 
        expect(node.rotateZ).to.equal(909); 
    }); 

    it('set lookAt()', () => {
        node.setLookAt(700, 800, 900);  
        expect(vec3.equals(node.lookAtVec, vec3.fromValues(700, 800, 900))).to.equal(true); 
    }); 

    /* A simple test of the functionality by generating a mini-scene graph */
    it('addChild/removeChild()', () => {
        const _node1 = node; 
        const _node2 = new Node("testNode2", "testNode2UUID"); 
        const _node3 = new Node("testNode3", "testNode3UUID"); 
        
        _node1.addChild(_node2); 
        _node1.addChild(_node3); 
        _node1.removeChild(_node2); 
        expect(compareNodeArrays(_node1.childNodes as Node[], [_node3])).to.equal(true); 
        _node1.removeChild(_node3);
        expect(compareNodeArrays(_node1.childNodes as Node[], [])).to.equal(true); 
    }); 

    it('createUUIDSceneGraph()', () => {
        const _node1 = node; 
        const _node2 = new Node("testNode2", "testNode2UUID"); 
        const _node3 = new Node("testNode3", "testNode3UUID"); 
        const _node4 = new Node("testNode2", "testNode4UUID"); 

        _node1.addChild(_node2); 
        _node1.addChild(_node3); 
        _node3.addChild(_node4); 

        const uuidSceneGraph:Record<string,string[]> = {}; 
        
        _node1.createUUIDSceneGraph(uuidSceneGraph); 

        /* A replication of how this scene graph should look */
        const uuidSceneGraphClone = {"testNode1UUID":["testNode2UUID", "testNode3UUID"],
                                    "testNode3UUID":["testNode4UUID"]}; 

        // TODO: replace with a better equality test. This method is super vulnerable to different orderings ect (which doesn't matter in an adjacency list)
        expect(compareObjectsJSON(uuidSceneGraph, uuidSceneGraphClone)).to.equal(true); 
    }); 

    it('jsonify()/setNodeFromJSON()', () => {
        const _node2 = new Node("testNode2", "uuidTwo"); 
        const json:string = node.jsonify(); 
        _node2.setNodeFromJSON(json); 
        compareNodesJsonifyFields(node, _node2); 
    }); 

    it('TODO: genLocalMatrix()', () => {
        // hand-craft a few matricies you know are correct and compare to them
        console.log("Not finished!"); 
    }); 

    it('TODO: updateWorldMatrix()', () => {
        // Create a scene graph of a few nodes, pre-compute their correct matrices and then verify 
        // that they are all similar (mat4.equals() accept some differences from float operations ect) on each node
        console.log("Not finished!"); 
    }); 
}); 

