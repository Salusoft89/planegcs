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