#!/bin/bash

set -e

pushd build_bindings
npm install && ./process_all.sh
# todo: generate gcs_system and gcs_system_mock typescript bindings from generated cpp
popd
emcmake cmake .
make -j $(nproc)
ls -lh bin