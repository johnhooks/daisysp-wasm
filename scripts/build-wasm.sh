#!/usr/bin/env sh

# exit when any command fails
set -e

# create the build artifact directory if it doesn't exist
mkdir -p build/wasm

# clean the build artifact directory
rm -rf build/wasm/*

# generate the Makefile
emcmake cmake -B ./build -S ./

# enter the build directory
cd build

# build the wasm module
make
