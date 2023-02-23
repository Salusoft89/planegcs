#!/bin/bash

set -e

node render_templates.mjs \
     gcs_system.cpp.njk ../bindings.cpp \
     gcs_system.ts.njk ../bin/gcs_system.ts \
     gcs_system_mock.ts.njk ../bin/gcs_system_mock.ts \
     constraints.ts.njk ../bin/constraints.ts 