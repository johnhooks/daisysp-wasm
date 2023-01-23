#!/usr/bin/env sh

# create the build artifact directory if it doesn't exist
mkdir -p dist

# clean the build artifact directory
rm -rf dist/*

# rollup the audio worklet processor
node_modules/.bin/rollup -c

# copy the worklet into the example website's public directory
cp dist/* example/public
