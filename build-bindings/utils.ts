// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  

// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.

// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.

// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA

import path from 'path';
import fs from 'fs';

export function camelToSnakeCase(str: string): string {
    str = str.replace(/([PL]2[PL])/, "$1_");
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

// [1, 2, 3, 4], 2 -> [[1, 2], [3, 4]]
export function arrToNTuples<T>(arr: T[], n: number): T[][] {
    return arr.reduce((acc: T[][], arg: T, i: number) => {
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

export function utilReadFile(fname: string): string {
    return fs.readFileSync(filePath(fname)).toString();
}