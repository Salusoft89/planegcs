#!/bin/bash

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
ts-node patch_file.ts GCS.cpp "Base::Console().Log" "Console::Log"
ts-node patch_file.ts GCS.cpp "<Base/Console.h>" "<Console.h>"
ts-node patch_file.ts GCS.cpp \
     "auto fut = std::async(&System::identifyDependentParametersSparseQR,this,J,jacobianconstraintmap, pdiagnoselist, /*silent=*/true);" \
     "identifyDependentParametersSparseQR(J, jacobianconstraintmap, pdiagnoselist, true);"
ts-node patch_file.ts GCS.cpp \
     "fut.wait();" \
     "// fut.wait();"

ts-node patch_file.ts headers/FCConfig.h "defined(linux)" "defined(unix)"