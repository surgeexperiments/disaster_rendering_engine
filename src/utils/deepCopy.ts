// TODO: this is a weak method, for complex items use a better deepCopy function
export function deepCopyObject(obj:unknown):unknown {
    return JSON.parse(JSON.stringify(obj));
}