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

cmake_minimum_required(VERSION 3.3)
project(PlaneGCS)

set(EXECUTABLE_OUTPUT_PATH "bin")

add_library(LibsModule
    GCS.cpp
    Geo.cpp
    Constraints.cpp
    SubSystem.cpp
    qp_eq.cpp
)

set(Boost_INCLUDE_DIR "/inc")
find_package(Boost REQUIRED)
include_directories(${Boost_INCLUDE_DIR})

include_directories("/usr/include/eigen3")

add_executable(planegcs bindings.cpp)

include_directories(planegcs headers)
target_link_libraries(planegcs LibsModule)

# note: exceptions are by default enabled in -O0, but disabled in -O1 and above
if(CMAKE_BUILD_TYPE STREQUAL "Release")
    set(BUILD_TYPE_FLAGS "-O3 -s WASM_BIGINT=0 -s ASSERTIONS=0 -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s ELIMINATE_DUPLICATE_FUNCTIONS=1")
else()
    set(BUILD_TYPE_FLAGS "-g -O0 -fwasm-exceptions -s ASSERTIONS=1")
endif()

set_target_properties(planegcs PROPERTIES LINK_FLAGS "${BUILD_TYPE_FLAGS} -lembind --closure 1 -s EXPORT_ES6=1 -s MODULARIZE=1 -s MALLOC=emmalloc -s NO_FILESYSTEM=1")

# turn off deprecated warnings coming from Boost
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-deprecated")

# todo: possible further flags?
# -s ENVIRONMENT=web
# -s ALLOW_MEMORY_GROWTH=1
# -s DISABLE_EXCEPTION_CATCHING=0
# -Wno-switch