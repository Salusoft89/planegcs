#!/bin/bash

set -e

emcmake cmake .
make -j $(nproc)
node generate_binding_types.mjs bindings.cpp bin/gcs_system.ts bin/constraints.ts