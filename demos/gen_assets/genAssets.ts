
import { DrawBufferOptimizationType, DrawStaticPrimitiveType } from "../../src/constants/constants";
import { WorldMesh } from "../../src/mesh/WorldMesh";
import { GLArrayBuffer   } from "../../src/mesh/GLBuffer"; 
import { positions } from "./assets"; 
import { Camera3D } from "../../src/camera/camera";
import { Scene } from "../../src/scene/scene";
import { mat4, vec3 } from "../../src/math/gl-matrix";
import { ColorMaterial } from "../../src/materials/colorMaterial";



export class GenTestAssets {
    
    constructor() {
        const json = this._genAssets(); 
        this._fileSave(json, "json.txt"); 
    }
    
    // https://stackoverflow.com/questions/13405129/javascript-create-and-save-file/53864791#53864791
    private _fileSave(sourceText:string, fileIdentity:string):void {
        const workElement = document.createElement("a");
        if ('download' in workElement) {
            workElement.href = "data:" + 'text/plain' + "charset=utf-8," + escape(sourceText);
            workElement.setAttribute("download", fileIdentity);
            document.body.appendChild(workElement);
            const eventMouse = document.createEvent("MouseEvents");
            eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            workElement.dispatchEvent(eventMouse);
            document.body.removeChild(workElement);
        } else throw 'File saving not supported for this browser';
    }
    
    
    // Simple scene to get things rolling 
    private _genAssets():string {
        const material = new ColorMaterial("test"); 
        material.color = new Float32Array([128, 128, 128, 1]); 
        
        const worldMesh = new WorldMesh("testWorldMesh", DrawStaticPrimitiveType.TRIANGLES); 
        worldMesh.material = material; 
        const glBuffer = new GLArrayBuffer(DrawBufferOptimizationType.STATIC_DRAW, positions.length); 
        glBuffer.setAttribPtrData(3, false, 0, 0);
        
        // F figure is upside down
        this._fixBuffer(positions); 

        worldMesh.setArrayBufferWithGLUpdate("position", positions, glBuffer);
        
        const camera = new Camera3D("testCamera"); 
        
        // Move away from the figure so we can see it
        camera.addTranslation(0, 0, -200); 
        camera.setLookAt(0,0,0); 
        const scene = new Scene("testScene"); 
        scene.addCamera(camera, true); 
        scene.addWorldMesh(worldMesh, true); 
        
        return scene.jsonify(); 
    }

    private _fixBuffer(buffer:number[]) {
        const rotationMatrix = mat4.create(); 
        mat4.fromRotation(rotationMatrix, Math.PI, vec3.fromValues(0,0,1)); 
        mat4.translate(rotationMatrix, rotationMatrix, vec3.fromValues(-50, -75, -15)); 

        //var matrix = m4.xRotation(Math.PI);
        //matrix = m4.translate(matrix, -50, -75, -15);

        for (let ii = 0; ii < buffer.length; ii += 3) {
            const vector = vec3.fromValues(buffer[ii + 0], buffer[ii + 1], buffer[ii + 2]);

            vec3.transformMat4(vector, vector, rotationMatrix); 
            //var vector = m4.vectorMultiply([positions[ii + 0], positions[ii + 1], positions[ii + 2], 1], matrix);
            buffer[ii + 0] = vector[0];
            buffer[ii + 1] = vector[1];
            buffer[ii + 2] = vector[2];
        }
    }
}

/* When the js file is loaded this will simply give the user a dl-request to download a text file with the json content */
const instance = new GenTestAssets(); 