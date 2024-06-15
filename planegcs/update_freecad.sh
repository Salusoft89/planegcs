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

# see https://stackoverflow.com/questions/600079/how-do-i-clone-a-subdirectory-only-of-a-git-repository/52269934#52269934
git clone --depth 1 --filter=tree:0 --sparse https://github.com/FreeCAD/FreeCAD.git
pushd FreeCAD
# the behaviour of this command might vary depending on the git version
git sparse-checkout set src/*.h src/*.hpp src/Mod/Sketcher/App/planegcs --skip-checks
git rev-parse HEAD > commit.txt
popd

# move the planegcs source files
mv FreeCAD/src/Mod/Sketcher/App/planegcs/* . 
# move the commit hash file
mv FreeCAD/commit.txt .
# move some required headers
mv FreeCAD/src/boost_graph_adjacency_list.hpp headers
mv FreeCAD/src/FCConfig.h headers
mv FreeCAD/src/FCGlobal.h headers

rm -rf FreeCAD

# apply patches
npx tsx patch_file.ts GCS.cpp "Base::Console().Log" "Console::Log"
npx tsx patch_file.ts GCS.cpp "<Base/Console.h>" "<Console.h>"
# disable using std::async (not available in emscripten without use of web workers)
# todo: fix following two (don't work after indentation changes)
# npx tsx patch_file.ts GCS.cpp \
#      "auto fut = std::async(&System::identifyDependentParametersSparseQR,this,J,jacobianconstraintmap, pdiagnoselist, /*silent=*/true);" \
#      "identifyDependentParametersSparseQR(J, jacobianconstraintmap, pdiagnoselist, true);"
npx tsx patch_file.ts GCS.cpp \
     "fut.wait();" \
     "// fut.wait();"
# fix passing the algorithm
npx tsx patch_file.ts GCS.cpp \
     "initSolution();" \
     "initSolution(alg);"

npx tsx patch_file.ts headers/FCConfig.h "defined(linux)" "defined(unix)"

npx tsx patch_file.ts headers/FCGlobal.h "#include <QtCore.h>" ""

# add Boost flag to avoid using std::unary_function, which doesn't work with newer clang
# https://github.com/boostorg/container_hash/issues/22
npx tsx patch_file.ts GCS.cpp \
     "#include <Console.h>" \
     "#define BOOST_NO_CXX98_FUNCTION_BASE
#include <Console.h>"

# SketcherGlobal.h includes macro SketcherExport, which is not necessary for our purposes, so we remove it
# (it only confuses the cpp parser)
npx tsx patch_file.ts Constraints.h \
     "#include \"../../SketcherGlobal.h\"" \
     ""

npx tsx patch_file.ts Constraints.h \
     "class SketcherExport" \
     "class"

npx tsx patch_file.ts GCS.h \
     "#include \"../../SketcherGlobal.h\"" \
     ""

npx tsx patch_file.ts GCS.h \
     "class SketcherExport" \
     "class"

npx tsx patch_file.ts Geo.h \
     "#include \"../../SketcherGlobal.h\"" \
     ""

npx tsx patch_file.ts Geo.h \
     "class SketcherExport" \
     "class"

