#!/usr/bin/env sh

# create the build directory if it doesn't exist
mkdir -p build

# generate the Makefile
emcmake cmake -B ./build -S ./

# enter the build directory and build the wasm module
cd build
make

# exit the build directory and copy the wasm module to the JavaScript src directory
cd ..
cp build/wasm/AudioProcessor.js src

# rollup the audio worklet processor
node_modules/.bin/rollup -c

# copy the worklet into the example website's public directory
cp dist/wasm-worklet-processor.js example/public
