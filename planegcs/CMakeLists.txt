project(PlaneGCS)
cmake_minimum_required(VERSION 3.3)

set(EXECUTABLE_OUTPUT_PATH "bin")

ADD_LIBRARY(LibsModule
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

ADD_EXECUTABLE(planegcs main.cpp)
# -s ALLOW_MEMORY_GROWTH=1
# -s DISABLE_EXCEPTION_CATCHING=0
# -Wno-switch
set_target_properties(planegcs PROPERTIES LINK_FLAGS "-lembind --closure 1 -s EXPORT_ES6=1 -s MODULARIZE=1 -Os -s MALLOC=emmalloc -s NO_FILESYSTEM=1")

target_link_libraries(planegcs LibsModule)