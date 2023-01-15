# Example Daisy Web Audio Worklet CMakeLists.txt

# To get started on a new worklet, copy this entire folder (containing this file and C++ sources) to
# a convenient location, and then start making modifications.

# The first line of any CMake project should be a call to `cmake_minimum_required`, which checks
# that the installed CMake will be able to understand the following CMakeLists, and ensures that
# CMake's behaviour is compatible with the named version. This is a standard CMake command, so more
# information can be found in the CMake docs.

cmake_minimum_required(VERSION 3.15)

# The top-level CMakeLists.txt file for a project must contain a literal, direct call to the
# `project()` command. `project()` sets up some helpful variables that describe source/binary
# directories, and the current project version. This is a standard CMake command.
project(AUDIO_PROCESSOR VERSION 0.0.1)

set(CMAKE_SOURCE_DIR worklet)
set(CMAKE_BINARY_DIR worklet)
set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/public/worklets)

add_subdirectory(DaisySP)

add_executable(AudioProcessor ${SOURCE_FILES})

# `target_sources` adds source files to a target. We pass the target that needs the sources as the
# first argument, then a visibility parameter for the sources which should normally be PRIVATE.
# Finally, we supply a list of source files that will be built into the target. This is a standard
# CMake command.
target_sources(AudioProcessor
    PRIVATE
    worklet/processor_bind.cc
    worklet/AudioProcessor.cc
    worklet/AudioProcessor.h)

# `target_compile_definitions` adds some preprocessor definitions to our target. For new
# definitions, pick unique names that are unlikely to collide! This is a standard CMake command.
# target_compile_definitions(AudioWorkletExample
# PUBLIC)

# `target_link_libraries` links other libraries or executables. If we'd generated a binary data
# target above, we would need to link to it here too. This is a standard CMake command.
target_link_libraries(AudioProcessor
    PUBLIC
    DaisySP)

add_definitions("--std=c++17")

set_target_properties(AudioProcessor
    PROPERTIES
    LINK_FLAGS "--bind -s SINGLE_FILE=1 -s WASM=1 -s BINARYEN_ASYNC_COMPILATION=0 -s ASSERTIONS=0 -O0 --post-js ./lib/em-es6-module.js")
