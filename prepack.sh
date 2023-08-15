#!/bin/bash

if [ -f planegcs_dist/planegcs.wasm ]; then 
    rm -rf dist && \
    tsc && \
    cp planegcs_dist/planegcs.wasm dist/planegcs_dist;
else
    echo 'Error: planegcs.wasm not present, run npm build:all before publishing'
    exit 1
fi
