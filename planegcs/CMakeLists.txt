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

ADD_EXECUTABLE(planegcs bindings.cpp)
# -s ALLOW_MEMORY_GROWTH=1
# -s DISABLE_EXCEPTION_CATCHING=0
# -Wno-switch
# -s ASSERTIONS=1 (for debugging memory issues)

# exceptions are by default enabled in -O0, but disabled in -O1 and above
set_target_properties(planegcs PROPERTIES LINK_FLAGS "-lembind --closure 1 -s EXPORT_ES6=1 -s MODULARIZE=1 -O0 -s MALLOC=emmalloc -s NO_FILESYSTEM=1 -s ASSERTIONS=1 -fwasm-exceptions")

target_link_libraries(planegcs LibsModule)