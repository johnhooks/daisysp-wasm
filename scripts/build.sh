#!/usr/bin/env sh

# create the build artifact directories if they don't exist
mkdir -p build/wasm
mkdir -p dist

# clean the build artifact directories
rm -rf build/wasm/**/*
rm -rf dist/**/*

# generate the Makefile
emcmake cmake -B ./build -S ./

# enter the build directory and build the wasm module
cd build
make

# exit the build directory and copy the wasm build artifiacts to the JavaScript src directory
cd ..
# cp build/wasm/* src

# rollup the audio worklet processor
node_modules/.bin/rollup -c

# copy the worklet into the example website's public directory
cp dist/* example/public
