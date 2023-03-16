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

import { readFileSync, writeFileSync } from 'fs';

// Check if filename, search string and replacement string are provided as arguments
if (process.argv.length !== 5) {
  console.log('Usage: ts-node patch_file.ts <filename> <search_string> <replacement_string>');
  process.exit(1);
}

const filename = process.argv[2];
const searchStr = process.argv[3];
const replaceStr = process.argv[4];

// Read the contents of the file
let fileContents: string;
try {
  fileContents = readFileSync(filename, 'utf-8');
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}

// Replace all occurrences of search string with replacement string
const replacedContents = fileContents.replaceAll(searchStr, replaceStr);

// Check if any occurrence is replaced
if (replacedContents !== fileContents) {
  // Write the updated contents back to the file
  try {
    writeFileSync(filename, replacedContents, 'utf-8');
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
} else {
  console.error(`No occurrences of '${searchStr}' found in the file ${filename}.`);
  process.exit(1);
}