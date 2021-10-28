

/**
 * @brief functions with the same postfix works together as their vertices line up when used for position and texture. 
 */
class BufferHelper {
    constructor() {}

    getRectangleArrayCCW(x, y, width, height) {
        let x2 = x + width;
        let y2 = y + height;
        return new Float32Array([
                x, y,
                x2, y,
                x, y2,
                x, y2,
                x2, y,
                x2, y2,
                ]); 
    }
    
    /**
     * @brief create a 1x1 texture quad and a 1x1x1. The triangles are clockwise. 
     */
    getUnitQuadFloat32ArrCW() {
        return new Float32Array([
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ]); 
    }
    
    getFlatUnitCubeFloat32ArrCW() {
        return new Float32Array([
            0, 0, 0,
            0, 1, 0,
            1, 0, 0,
            1, 0, 0,
            0, 1, 0,
            1, 1, 0]); 
    }

    // Beautiful function name 
    getHorizontallyCenteredFlatUnitCubeFloat32ArrCW() {
        return new Float32Array([
            -0.5, -0.5, 0, 
            -0.5, 0.5, 0,
            0.5, -0.5, 0,
            0.5, -0.5, 0,
            -0.5, 0.5, 0,
            0.5, 0.5, 0]); 
    }

    getFlatUnitCubeFloat32ArrCCW() {
        //TODO: add this arr to the buffer_helper (how do you name it to differentiate from the other one already there?)
        return new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,
            ]); 
    }
}