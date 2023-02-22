#!/bin/bash

set -e

pushd build_bindings
npm install && node process_bindings.mjs \
     gcs_system.cpp.njk ../bindings.cpp \
     gcs_system.ts.njk ../bin/gcs_system.ts \
     gcs_system_mock.ts.njk ../bin/gcs_system_mock.ts \
     constraints.ts.njk ../bin/constraints.ts 
# todo: generate gcs_system and gcs_system_mock typescript bindings from generated cpp
popd
emcmake cmake .
make -j $(nproc)
ls -lh bin