# Installation and import

Install with `npm install @salusoft89/planegcs`

With Vite/TS:
```ts
import wasm_url from "@salusoft89/planegcs/dist/planegcs_dist/planegcs.wasm?url";
export async function init_gcs_system() {
	const mod = await init_planegcs_module({ locateFile: () => wasm_url });
   return new mod.GcsSystem();
}

const gcs_system = await init_gcs_system();
```


# Developing

Install [Docker](https://docs.docker.com/get-docker/) and [Node.js](https://nodejs.org/en).
- note: NodeJS v16 is required, newer versions currently don't work because of the tree-sitter dependency
- you may use [nvm](https://github.com/nvm-sh/nvm) to install NodeJS v16 along other versions of Node

Build command: `npm run build:all`, which consists of these steps:
   - `npm run build:docker` - pulls/builds the docker image for building C++ files from FreeCAD
   - `npm run build:bindings` - creates a C++ binding for the FreeCAD API (partly by scanning the source code)
   - `npm run build:wasm` - builds the planegcs.wasm and planegcs.js files from the C++ binding and source files


To run a script that updates the FreeCAD source files, run `npm run update-freecad`. It is not guaranteed that the parsing scripts will work with newer versions of FreeCAD, so you may have to adjust them.