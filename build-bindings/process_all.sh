#!/bin/bash

# This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
# Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  

# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.

# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.

# You should have received a copy of the GNU Lesser General Public
# License along with this library; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA

set -e

mkdir -p ../planegcs_dist

npx tsx ./render_templates.ts \
     gcs_system.cpp.njk ../planegcs/bindings.cpp \
     enums.ts.njk ../planegcs_dist/enums.ts \
     id.ts.njk ../planegcs_dist/id.ts \
     gcs_system.ts.njk ../planegcs_dist/gcs_system.ts \
     gcs_system_mock.ts.njk ../planegcs_dist/gcs_system_mock.ts \
     constraints.ts.njk ../planegcs_dist/constraints.ts \
     constraint_param_index.ts.njk ../planegcs_dist/constraint_param_index.ts \

# this file would be normally redundant, but it is to make ts checker happy
# while running a subset of tests (npm run test:basic)
if [ ! -f ../planegcs_dist/planegcs.js ]; then
    echo 'export default {};' > ../planegcs_dist/planegcs.js
fi

cp types/planegcs.d.ts ../planegcs_dist/planegcs.d.ts