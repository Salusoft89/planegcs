FROM emscripten/emsdk:3.1.45

RUN apt-get update && \
    # Install dependencies (Eigen3, Boost required for compiling PlaneGCS)
    apt-get install -qqy libeigen3-dev \ 
    libboost-system-dev libboost-thread-dev libboost-program-options-dev libboost-test-dev libboost-filesystem-dev

# fixes incorrect including of boost in CMakeLists.txt
RUN mkdir /inc && \
    ln -sf /usr/include/boost /inc