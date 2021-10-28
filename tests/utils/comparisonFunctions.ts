/* NOTE: The JSON comparison approach is pretty weak, but it will not give false negatives. If anything: it breaks too often! 
   For simple stuff like AttribList and UniformList this should suffice. IF required: Switch to Lodash isEqual(). 
   https://github.com/lodash/lodash/blob/4.17.15/lodash.js#L6839 
*/
export function compareObjectsJSON(one:unknown, two:unknown):boolean {
    return JSON.stringify(one) === JSON.stringify(two);
}

export function compareStringSets(one:Set<string>, two:Set<string>):boolean {
    return compareObjectsJSON([...one], [...two]);
}