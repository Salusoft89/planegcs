#!/bin/bash

set -e

emcmake cmake .
make -j $(nproc)
node generate_binding_types.mjs main.cpp bin/planegcs.ts bin/constraints.ts