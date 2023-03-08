#!/bin/bash

set -e

npm exec --prefix planegcs/build_bindings ts-node render_templates.ts \
     gcs_system.cpp.njk ../bindings.cpp \
     gcs_system.ts.njk ../bin/gcs_system.ts \
     gcs_system_mock.ts.njk ../bin/gcs_system_mock.ts \
     constraints.ts.njk ../bin/constraints.ts \
     constraint_param_index.js.njk ../bin/constraint_param_index.js