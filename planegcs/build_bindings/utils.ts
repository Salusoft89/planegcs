import path from 'path';

export function camelToSnakeCase(str: string): string {
    str = str.replace(/([PL]2[PL])/, "$1_");
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

// [1, 2, 3, 4], 2 -> [[1, 2], [3, 4]]
export function arrToNTuples(arr, n: number) {
    return arr.reduce((acc, arg, i) => {
        if (i % n === 0) {
            acc.push([arg]);
        } else {
            acc[acc.length - 1].push(arg);
        }
        return acc;
    }, []);
}

// fix relative paths for nodejs
export function filePath(fname: string): string {
    return path.dirname(process.argv[1]) + "/" + fname;
}