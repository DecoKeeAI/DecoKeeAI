
export function deepCopy(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }

    let result = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = deepCopy(obj[key]);
        }
    }

    return result;
}
