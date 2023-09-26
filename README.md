# Installation and import

Install with `npm install @salusoft89/planegcs`.

The main class for working with planegcs is GcsWrapper and can be instantiated as follows:
```js
import { init_planegcs_module, GcsWrapper } from '@salusoft89/planegcs';
async function init_gcs_wrapper() {
	const mod = await init_planegcs_module();
   const gcs_system = new mod.GcsSystem();
   const gcs_wrapper = new GcsWrapper(gcs_system);
   return gcs_wrapper;
}

init_gcs_wrapper().then(gcs_wrapper => {
   // ...
});
```

If using Vite, then you need to explicitly set the .wasm file import url:
```ts
import wasm_url from "@salusoft89/planegcs/dist/planegcs_dist/planegcs.wasm?url";
// ...
const mod = await init_planegcs_module({ locateFile: () => wasm_url });
// ...
```

# Usage 

The input for the solver is an array of primitives. Each sketch primitive is either a geometry or a constraint. The primitives might reference each other by their ids. 

```js

const sketch_index = [ 
    { id: 1, type: 'point', x: 10, y: 10, fixed: false },
    { id: 2, type: 'point', x: 20, y: 20, fixed: false },
 
    { id: 3, type: 'p2p_coincident', p1_id: 1, p2_id: 2 },
 ];

gcs_wrapper.push_primitives_and_params(sketch_index);
gcs_wrapper.solve();
gcs_wrapper.apply_solution();

console.log(gcs_wrapper.sketch_index.get_primitives());
// outputs
// [
//    { id: 1, type: 'point', x: 10, y: 10, fixed: false },
//    { id: 2, type: 'point', x: 10, y: 10, fixed: false },                <<< x and y changed
//    { id: 3, type: 'p2p_coincident', p1_id: 1, p2_id: 2 },
// ]

```

<!-- Apart from primitives, also sketch parameters might be present and referenced in constraints. -->

# Developing

Install [Docker](https://docs.docker.com/get-docker/) and [Node.js](https://nodejs.org/en).

Build command: `npm run build:all`, which consists of these steps:
   - `npm run build:docker` - pulls/builds the docker image for building C++ files from FreeCAD
   - `npm run build:bindings` - creates a C++ binding for the FreeCAD API (partly by scanning the source code)
   - `npm run build:wasm` - builds the planegcs.wasm and planegcs.js files from the C++ binding and source files


To run a script that updates the FreeCAD source files, run `npm run update-freecad`. It is not guaranteed that the parsing scripts will work with newer versions of FreeCAD, so you may have to adjust them.