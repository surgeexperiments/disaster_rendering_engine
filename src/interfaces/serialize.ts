


/**
 * Interfaces, abstract classes and the static kw seems to match badly in Typescript. 
 * Avoiding this by using a workaround found here: 
 * 
 * https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface
 */
export interface SerializeAndSet {
    jsonify():string; 
    setFromJSON(json:string):void; 
}

export interface Serialize {
    jsonify():string; 
}

/* Implement using @staticImplements<SerializeSetCreate> */
export interface SerializeSetAndCreate {
    new():SerializeAndSet; 
    createFromJSON(json:string):unknown; 
}

/* Implement using @staticImplements<SerializeCreate> if you need this as a public static member */
export interface SerializeCreate {
    createFromJSON(json:string):unknown; 
}


export function staticImplements<T>() {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return <U extends T>(constructor: U) => {constructor};
}

