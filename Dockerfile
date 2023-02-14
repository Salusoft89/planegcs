FROM emscripten/emsdk

RUN apt-get update && \
    # Install dependencies (Eigen3, Boost required for compiling PlaneGCS)
    apt-get install -qqy libeigen3-dev libboost-system-dev libboost-thread-dev libboost-program-options-dev libboost-test-dev

RUN apt-get install -qqy libboost-filesystem-dev

# fixes incorrect including of boost in CMakeLists.txt
RUN mkdir /inc
RUN ln -sf /usr/include/boost /inc