#!/bin/bash

set -e

mkdir -p ../bin

ts-node render_templates.ts \
     gcs_system.cpp.njk ../bindings.cpp \
     gcs_system.ts.njk ../bin/gcs_system.ts \
     gcs_system_mock.ts.njk ../bin/gcs_system_mock.ts \
     constraints.ts.njk ../bin/constraints.ts \
     constraint_param_index.js.njk ../bin/constraint_param_index.js \

# this file would be normally redundant, but it is to make ts checker happy
# while running a subset of tests (npm run test:basic)
echo 'export default {};' > ../bin/planegcs.js