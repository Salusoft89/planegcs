# About planegcs

Planegcs is a 2D geometric constraint solver from [FreeCAD](https://github.com/FreeCAD/FreeCAD/tree/main/src/Mod/Sketcher/App/planegcs). This repository is a port of the C++ code to WebAssembly, so that it can be used in the browser or node environments. The solving is based on numeric optimization methods, such as `DogLeg`, `Levenberg-Marquardt`, `BFGS` or `SQP`. Apart from the WebAssembly module and the wrapper class, this library contains complete TypeScript annotations.

This repository includes two PDF documents created by members of the FreeCAD community in the `doc` folder: Sketcher Lecture (by Christoph Blaue), which is a user-level description of FreeCAD's Sketcher, and Solver manual (by Abdullah Tahiri), which is a lower-level description of the planegcs solver.

## Features

- [x] Point, Line, Circle, Arc, Ellipse, Elliptical arc, Hyperbola, Parabola, Hyperbolical arc, Parabolical arc
- [x] All constraints from planegcs (see `planegcs_dist/constraints.ts`)
- [x] Reference sketch parametries or geometry properties in the constraints
- [x] Non-driving and temporary constraints
- [x] Validation code for sketch primitives (in a separate library [planegcs-validation](https://github.com/Salusoft89/planegcs-validation)) 
- [ ] Higher-level data model (WIP)
- [ ] B-Spline
- [ ] Multithreading execution of QR decomposition (GcsSystem.cpp:4811,4883)
- [ ] Support for constraints referencing other constraints

# Example usage

The geometries and constraints are represented by JSON objects, which are called (sketch) primitives. A list of primitives is an input for the solver. The primitives might reference each other by their ids.

```js

const primitives = [ 
    { id: '1', type: 'point', x: 10, y: 10, fixed: false },
    { id: '2', type: 'point', x: 20, y: 20, fixed: false },
 
    { id: '3', type: 'p2p_coincident', p1_id: '1', p2_id: '2' },
 ];

gcs_wrapper.push_primitives_and_params(primitives);
gcs_wrapper.solve();
gcs_wrapper.apply_solution();

console.log(gcs_wrapper.sketch_index.get_primitives());
// outputs
// [
//    { id: '1', type: 'point', x: 10, y: 10, fixed: false },
//    { id: '2', type: 'point', x: 10, y: 10, fixed: false },                <<< x and y changed
//    { id: '3', type: 'p2p_coincident', p1_id: '1', p2_id: '2' },
// ]

```

# Installation and import

Install with `npm install @salusoft89/planegcs`.

The main class for working with planegcs is GcsWrapper and can be instantiated as follows:
```js
import { init_planegcs_module, GcsWrapper } from '@salusoft89/planegcs';
async function init_gcs_wrapper() {
   const mod = await init_planegcs_module();
   const gcs_system_wasm = new mod.GcsSystem();
   const gcs_wrapper = new GcsWrapper(gcs_system_wasm);
   return gcs_wrapper;
}

init_gcs_wrapper().then(gcs_wrapper => {
   do_something_with_gcs_wrapper(gcs_wrapper);

   // explicit de-allocation of the Wasm memory must be called
   gcs_wrapper.destroy_gcs_module();
});
```

If using Vite, then you need to explicitly set the .wasm file import url:
```ts
import wasm_url from "@salusoft89/planegcs/dist/planegcs_dist/planegcs.wasm?url";
// ...
const mod = await init_planegcs_module({ locateFile: () => wasm_url });
// ...
```

# Geometries

This library supports all geometries that are implemented in the original solver:

## Point, Line, Circle
   
```ts
{ id: '1', type: 'point', x: 10, y: 10, fixed: false },
{ id: '2', type: 'point', x: 0, y: 0, fixed: false }
```
When `fixed` is set to true, then the point's coordinates are not changed during solving.

```ts
{ id: '3', type: 'line', p1_id: '1', p2_id: '2' }
```
A line is defined by two points, which must have lower ids.

```ts
{ id: '4', type: 'circle', c_id: CENTER_POINT_ID, radius: 100 }
```

## Arc

An arc requires three points to be defined (center, start, end) and a subsequent planegcs-specific constraint `arc_rules` that keeps the endpoints (start_id, end_id) aligned with the start_angle and end_angle.

```ts
{ id: '5', type: 'arc', c_id: CENTER_POINT_ID, radius: 100,
 start_angle: 0, end_angle: Math.PI / 2,
 start_id: START_POINT_ID, end_id: END_POINT_ID }

{ id: '6', type: 'arc_rules', a_id: '5'  }
```

## Ellipse

An ellipse is represented in planegcs by its minor radius (length of the semi-minor axis) and F1 (one of its focal points):

```ts
{ id: '7', type: 'ellipse', c_id: CENTER_POINT_ID, focus1_id: F1_POINT_ID, radmin: 100 }
```

![ellipse](https://upload.wikimedia.org/wikipedia/commons/9/96/Ellipse-def0.svg)

The ellipse can be further constrained using planegcs-internal constraints for the major and minor diameters:

```ts
{ id: '8', type: 'internal_alignment_ellipse_major_diameter', e_id: '7', p1_id: ..., p2_id: ...}
{ id: '9', type: 'internal_alignment_ellipse_minor_diameter', e_id: '7', p1_id: ..., p2_id: ...}
```

## Elliptical arc

The elliptical arc again requires another constraint to keep the start/end points aligned:

```ts
{ id: '10', type: 'arc_of_ellipse', c_id: CENTER_POINT_ID, focus1_id: F1_POINT_ID,
  radmin: 100, start_angle: 0, end_angle: Math.PI / 2,
  start_id: START_POINT_ID, end_id: END_POINT_ID }

{ id: '11', type: 'arc_of_ellipse_rules', a_id: '10' }
```

Same as for the ellipse, it can be constrained by the major/minor diameter alignment constraints.

## Hyperbola, Parabola, Hyperbolical arc, Parabolical arc

Defined similarly to an ellipse/elliptical arc. See the type definitions in `sketch/sketch_primitive.ts`.

## B-Spline

B-Spline from planegcs is currently not yet fully supported. (WIP)

# Constraints

Planegcs supports a wide range of constraints. All available constraint types are in `planegcs_dist/constraints.ts`.

The values of the constraints can be set direclty as a number, reference a sketch parameter, or reference a property of a geometry with lower ID:

1. Parameter value as a number:
```ts
{ id: '3', type: 'p2p_distance', p1_id: '1', p2_id: '2', distance: 100 }
```

2. Parameter value as a reference to a sketch parameter:
```ts
{ id: '3', type: 'p2p_angle', p1_id: '1', p2_id: '2', angle: 'my_distance' }
```

3. Parameter value as a reference to a property of a geometry with ID o_id
```ts
{ 
   id: '3', 
   type: 'difference',
   param1: {
      o_id: '1',
      prop: 'x',
   },
   param2: {
      o_id: '2',
      prop: 'y',
   },
   difference: 100,
}
```
Currently, the object referenced with o_id can be only a geometry, referencing constraints is not supported.

## Driving, Temporary flags and Scale

Each constraint has following (optional) properties:

- `driving` (default true) - if set to false, then the constraint doesn't influence the geometries during solving, but instead can be used for measurements

- `temporary` (default false) - if set to true, then the constraint is only enforced so much that it doesn't conflict with other constraints. This is useful for constraints for mouse dragging in a Sketcher user interface. Temporary constraints don't reduce DOF. The presence of temporary constraints changes the algorithm used for solving in planegcs, regardless of the configured algorithm.

- `scale` (default 1) - sets the scale for an error of a constraint. Scale lower than 1 makes the constraint less prioritized by the solver and vice versa.

# Solving

Following methods can be called in the GcsWrapper to change the behavior of solving:

- `set_max_iterations(max_iterations: number)` - sets the maximum number of iterations for the solver. Default is 100.
- `set_convergence_threshold(convergence_threshold: number)` - sets the convergence threshold for the solver. Default is 1e-10.
- `set_debug_mode(debug_mode: DebugMode)` - sets the level of Debug, where DebugMode is NoDebug, Minimal, or IterationLevel

Furthermore, the solving can be altered via setting the algorithm to the solve method:

- `solve(algorithm: Algorithm)` - where Algorithm is an enum with following values: [DogLeg](https://en.wikipedia.org/wiki/Powell%27s_dog_leg_method), [LevenbergMarquardt](https://en.wikipedia.org/wiki/Levenberg%E2%80%93Marquardt_algorithm), or [BFGS](https://en.wikipedia.org/wiki/Broyden%E2%80%93Fletcher%E2%80%93Goldfarb%E2%80%93Shanno_algorithm). Default is DogLeg.

Note: when the sketch containts constraints with a flag `temporary` set to true, then the parameter is ignored and instead the [SQP](https://en.wikipedia.org/wiki/Sequential_quadratic_programming) algorithm is used.

# Developing

Install [Docker](https://docs.docker.com/get-docker/) and [Node.js](https://nodejs.org/en).

Build command: `npm run build:all`, which consists of these steps:
   - `npm run build:docker` - pulls/builds the docker image for building C++ files from FreeCAD
   - `npm run build:bindings` - creates a C++ binding for the FreeCAD API (partly by scanning the source code)
   - `npm run build:wasm` - builds the planegcs.wasm and planegcs.js files from the C++ binding and source files

To run a script that updates the FreeCAD source files, run `npm run update-freecad`. It is not guaranteed that the parsing scripts will work with newer versions of FreeCAD, so you may have to adjust them.

# Tests

The tests for the library are in the `test` folder and can be run with `npm test`. A subset of tests that doesn't require the compiled WebAssembly module can be run with `npm run test:basic`.


# Further materials

This library was a part of creating my thesis (included in the repo in `docs/sketcher-thesis.pdf`). Though it might be a bit outdated, this thesis
describes how the UI for sketching was implemented using this library. The thesis also includes some background around the maths behind the numerical optimization methods used in this solver.

A nicely prepared (interactive) resource about geometric constraint solving is [CAD in 1 hour](https://fab.cba.mit.edu/classes/865.24/topics/design-tools/#constraints) from an MIT course, accompanied by a [video lesson](https://mit.zoom.us/rec/share/mSbxXU1ap3euZp8TjonDAqmOeXrBUwPXN9e-dJ2e2kWVZ_HxQu6PQFhioWVrFPtt.O3SoIRlOUhdLGrsS).
