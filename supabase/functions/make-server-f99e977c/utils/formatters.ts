// @ts-nocheck
export const toCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(toCamelCase);
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            acc[camelKey] = toCamelCase(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};

export const toSnakeCase = (obj: any): any => {
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            acc[snakeKey] = obj[key];
            return acc;
        }, {} as any);
    }
    return obj;
};
