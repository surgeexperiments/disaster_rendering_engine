

export function createSphereVertices( 
    radius:number,
    subdivisionsAxis:number,
    subdivisionsHeight:number,
    opt_startLatitudeInRadians?:number,
    opt_endLatitudeInRadians?:number,
    opt_startLongitudeInRadians?:number,
    opt_endLongitudeInRadians?:number): Record<string, unknown>; 

export function createCubeVertices(size:number): Record<string, unknown>; 

/*
export interface AssetCreator {
    createSphereVertices( 
        radius:number,
        subdivisionsAxis:number,
        subdivisionsHeight:number,
        opt_startLatitudeInRadians?:number,
        opt_endLatitudeInRadians?:number,
        opt_startLongitudeInRadians?:number,
        opt_endLongitudeInRadians?:number): Record<string, unknown>; 

    createCubeVertices(size:number): Record<string, unknown>; 
}

//declare const assetCreator: AssetCreator;
*/