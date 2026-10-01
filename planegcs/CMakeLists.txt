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

cmake_minimum_required(VERSION 3.13)
project(PlaneGCS)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")

add_library(LibsModule STATIC
    GCS.cpp
    Geo.cpp
    Constraints.cpp
    SubSystem.cpp
    qp_eq.cpp
)

# Boost is header-only here; /inc is a symlink created in the Dockerfile
# because emscripten does not search /usr/include.
target_include_directories(LibsModule PUBLIC
    /inc
    /usr/include/eigen3
    headers
)

# turn off deprecated warnings coming from Boost
target_compile_options(LibsModule PUBLIC -Wno-deprecated)

add_executable(planegcs bindings.cpp)
target_link_libraries(planegcs LibsModule)

# note: exceptions are by default enabled in -O0, but disabled in -O1 and above
if(CMAKE_BUILD_TYPE STREQUAL "Release")
    set(BUILD_TYPE_FLAGS -O3 -sASSERTIONS=0 -sERROR_ON_UNDEFINED_SYMBOLS=0 -sELIMINATE_DUPLICATE_FUNCTIONS=1)
else()
    set(BUILD_TYPE_FLAGS -g -O0 -fwasm-exceptions -sASSERTIONS=1)
endif()

# STACK_SIZE fixes memory issue with sketches of > 100 items and (interestingly) temporary constraints
# EMBIND_AOT is used to avoid a dynamic Function call, see https://github.com/Salusoft89/planegcs/pull/12
target_link_options(planegcs PRIVATE
    ${BUILD_TYPE_FLAGS}
    -lembind
    --closure=1
    -sEXPORT_ES6=1
    -sMODULARIZE=1
    -sMALLOC=emmalloc
    -sNO_FILESYSTEM=1
    -sSTACK_SIZE=5MB
    -sEMBIND_AOT=1
)
