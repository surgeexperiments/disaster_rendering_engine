/*
Ported from: TODO: add reference 
*/

import { mat4 } from "../math/gl-matrix";
import { AABB } from "./boundingBoxAABB";
import { Plane } from "./plane";
  
  
enum PLANE  {
    TOP = 0,
    BOTTOM,
    LEFT,
    RIGHT,
    NEAR,
    FAR
}

export enum PLACEMENT {
    OUTSIDE, 
    INTERSECT, 
    INSIDE
}

/**
 * This class is based on Gribb/Hartman's method for extracting the view frustrum from the cameras viewProjection matrix. 
 * www.cs.otago.ac.nz/postgrads/alexis/planeExtraction.pdf 
 * 
 * It is also based on tutorials like the one found here: https://cgvr.informatik.uni-bremen.de/teaching/cg_literatur/lighthouse3d_view_frustum_culling/index.html.
 * 
 * The code has some modifications compared to the original Gribb/Hartman method and the code found in the tutorials, mainly the transposition of the matrix 
 * in frustrumFromMVPMatrix() to get the correct planes set. 
 * 
 * After trying multiple frustrum culling methods I found that extracting the frustrum planes from the viewProjection matrix were the most practical. There are
 * other methods like the "geometry method" (see tutorial), but it's not as useful when working with stuff like orthographic matricies.
 */
export class Frustrum {
    
    private planes:Plane[]; 

    constructor() {
        this.planes = [];
        
        for(let i=0; i<6; ++i) { 
            this.planes.push(new Plane()); 
        }
    }
    
  
    /**
     * Extract the frustrum directly from the cameras view projection matrix. 
     * Works for both orthographic and projection matricies.
     * 
     * Based on Gribb/Hartmans method found here: www.cs.otago.ac.nz/postgrads/alexis/planeExtraction.pdf 
     * 
     * TODO: does this work for hyperbolic or spherical projection matricies and other strange stuff?
     * 
     * @param matrix camera's view projection matrix from gl-matrix. 
     */
    frustrumFromMVPMatrix(matrix:Float32Array):void {
        const m:Float32Array = mat4.create(); 

        /* gl-matrix states in the documentation: Format: column-major, when typed out it looks like row-major 
         * The algorithm doesn't work without transposing the matrix, all the normal vectors are clearly wrong. 
         */
        mat4.transpose(m, matrix); 

        this.planes[PLANE.TOP].setCoefficients(-m[4] + m[12],
                                               -m[5] + m[13],
                                               -m[6] + m[14],
                                               -m[7] + m[15]);

        this.planes[PLANE.BOTTOM].setCoefficients(m[4] + m[12],
                                                  m[5] + m[13],
                                                  m[6] + m[14],
                                                  m[7] + m[15]);

        this.planes[PLANE.LEFT].setCoefficients(m[0] + m[12],
                                                m[1] + m[13],
                                                m[2] + m[14],
                                                m[3] + m[15]);

        this.planes[PLANE.RIGHT].setCoefficients(-m[0] + m[12],
                                                 -m[1] + m[13],
                                                 -m[2] + m[14],
                                                 -m[3] + m[15]);
        
        this.planes[PLANE.NEAR].setCoefficients(m[8] + m[12],
                                                m[9] + m[13],
                                                m[10] + m[14],
                                                m[11] + m[15]);

        this.planes[PLANE.FAR].setCoefficients(-m[8] + m[12],
                                               -m[9] + m[13],
                                               -m[10] + m[14],
                                               -m[11] + m[15]); 
    }
    

    pointInFrustum(p:Float32Array):PLACEMENT {
        for(let i=0; i < 6; i++) {
            if (this.planes[i].distance(p) < 0)
                return PLACEMENT.OUTSIDE;
        }
        return PLACEMENT.INSIDE; 
    }
  
  
    sphereInFrustum(p:Float32Array, radius:number):PLACEMENT {
        let result = PLACEMENT.INSIDE;
        let distance:number;
        
        for(let i=0; i < 6; i++) {
            distance = this.planes[i].distance(p);
            if (distance < -radius)
                return PLACEMENT.OUTSIDE;
            else if (distance < radius)
                result =  PLACEMENT.INTERSECT;
        }

        return(result);
    }
  
  
    boxInFrustum(b:AABB):PLACEMENT {
        let result = PLACEMENT.INSIDE;
        for(let i=0; i < 6; i++) {
            if (this.planes[i].distance(b.findPVertex(this.planes[i].normal)) < 0) {
                return PLACEMENT.OUTSIDE;
            } 
            else if (this.planes[i].distance(b.findNVertex(this.planes[i].normal)) < 0) {
                result =  PLACEMENT.INTERSECT;
            }
        }
        
        return result;
   }
}
  
  