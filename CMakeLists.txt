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

ADD_EXECUTABLE(planegcs main.cpp)
target_link_libraries(planegcs LibsModule)