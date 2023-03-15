#!/bin/bash

set -e

mkdir -p ../dist

npx tsx ./render_templates.ts \
     gcs_system.cpp.njk ../planegcs/bindings.cpp \
     gcs_system.ts.njk ../dist/gcs_system.ts \
     gcs_system_mock.ts.njk ../dist/gcs_system_mock.ts \
     constraints.ts.njk ../dist/constraints.ts \
     constraint_param_index.js.njk ../dist/constraint_param_index.js \

# this file would be normally redundant, but it is to make ts checker happy
# while running a subset of tests (npm run test:basic)
echo 'export default {};' > ../dist/planegcs.js