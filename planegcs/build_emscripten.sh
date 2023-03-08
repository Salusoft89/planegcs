#!/bin/bash

set -e

emcmake cmake .
make -j $(nproc)
ls -lh bin