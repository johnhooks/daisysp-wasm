#!/usr/bin/env sh

# exit when any command fails
set -e

# compile C++ source into a WASM module
./scripts/build-wasm.sh

# compile TypeScript into JavaScript bundle
./scripts/build-js.sh
