
/* JSON.stringify doesn't work with sets.
  TODO: Probably a better way to do this?
*/
export function stringArrayToSet(arr:string[]): Set<string> {
    const s = new Set<string>(); 
    for(let i=0; i<arr.length; ++i) {
        s.add(arr[i]); 
    }
    return s; 
}