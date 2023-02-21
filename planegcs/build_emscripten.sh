#!/bin/bash

set -e

pushd build_bindings
npm install && node process_bindings.mjs \
     gcs_system.cpp.njk ../bindings.cpp \
     gcs_system.ts.njk ../bin/gcs_system.ts
# todo: generate bindings for constraints
popd
emcmake cmake .
make -j $(nproc)
ls -lh bin