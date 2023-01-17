# WASM DaisySP AudioWorkletProcessor Example

## Goal

Create a Web Audio Worklet that uses [DaisySP](https://github.com/electro-smith/DaisySP) for signal processing.

## Example website

Checkout a functional [example](https://johnhooks.io/daisysp-wasm) using `daisysp::Oscillator`.

## Building the project

1. Install [Emscripten](https://emscripten.org/docs/getting_started/downloads.html#installation-instructions-using-the-emsdk-recommended)
2. Install [Node.js](https://nodejs.org/en/download/)
3. Make sure both Emscripten and Node.js executables are in the shell `PATH`
4. Clone this repository
   ```sh
   git clone https://github.com/johnhooks/daisysp-wasm-example.git
   ```
5. Enter the directory, install dependencies and run the build script
   ```sh
   cd daisysp-wasm-example
   yarn install     # or npm install
   yarn build       # or npm run build
   ```
6. The project has an example website. To start the dev server
   ```sh
   yarn website:dev # or npm run website:dev
   ```
7. Visit [localhost:5173](http://127.0.0.1:5173/) to checkout the example.

## About `scripts/build.sh`

The C++ source code for the audio processor is located in the `worklet` directory.

A `Makefile` is generated in the `build` directory using `emcmake cmake -B ./build -S ./`.

After entering the `build` directory, `make` is called and the WASM file is build in the `build/wasm` directory. The wasm file is inlined into the wrapping JavaScript code for ease of loading.

The generated file is copied to the `src` directory.

`rollup` bundles the audio worklet processor JavaScript code.

The bundled file is copied into the `example/public` directory to be loaded as an `AudioWorket` in the example website.

**An example of how to create an `AudioNode` from the worklet**

```js
let context = new AudioContext();
await context.audioWorklet.addModule("wasm-worklet-processor.js");
let audioNode = new AudioWorkletNode(context, "wasm-worklet-processor");
```

## Inputs and Outputs

### How to access the inputs and outputs from JS audio worklet in C++

Google in their [example](https://github.com/GoogleChromeLabs/web-audio-samples/blob/eed2a8613af551f2b1d166a01c834e8431fdf3c6/src/audio-worklet/design-pattern/wasm/SimpleKernel.cc)
use raw pointers to memory allocated in the WASM heap, but first the inputs and outputs are transformed. The WASM heap is an `Uint16Array` and the [wasm-audio-helper.js](https://github.com/johnhooks/web-audio-samples/blob/eed2a8613af551f2b1d166a01c834e8431fdf3c6/src/audio-worklet/design-pattern/lib/wasm-audio-helper.js) preforms some magic to convert each of the arrays of `inputs` and `outputs` arguments of the `AudioWorkletProcessor#process` method to a single array of `Float32Array`, chaining the channels one after the other.

In the Emscripten binding, raw pointers are cast to `float*` to access the `input`/`output` data on WASM heap in the C++ code. There is a warning about using [raw pointers](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html#raw-pointers) somewhere in the documentation, I am having some trouble finding it, but the gist was that there isn't any guarantee on the lifetime of a raw pointer. Though since its being using in the `process` method of the audio processor and not used after leaving the callback's scope, I hope it's reasonably safe.

```cpp
 void process(uintptr_t input_ptr, uintptr_t output_ptr, unsigned channel_count) {
    float* input_buffer = reinterpret_cast<float*>(input_ptr);
    float* output_buffer = reinterpret_cast<float*>(output_ptr);
}
```

**ref** [reinterpret_cast](https://en.cppreference.com/w/cpp/language/reinterpret_cast)

## Things to research

I am a total novice of both C++ and WASM, I have a lot to learn.

- I think DaisySP expects the sample to be interwoven and the Web Audio API uses a planar buffer format.
- Need to be flexible on the number of frames per call to render. Googles examples expect it to be 128, though MDN warns that it could change in the future to be variable.
- [Changing audio buffer/blocksize of the Daisy Seed](https://forum.electro-smith.com/t/changing-audio-buffer-blocksize-of-the-daisy-seed/283)
- [Building LLVM](https://emscripten.org/docs/building_from_source/index.html#building-llvm)

## Inspiration

- [Web Audio Samples by Chrome Web Audio Team](https://github.com/GoogleChromeLabs/web-audio-samples/tree/main)
- [Daisy-Juce-Example](https://github.com/electro-smith/Daisy-Juce-Example/tree/main)

## Important references

- [emscripten.org](https://emscripten.org/index.html)
- [Basic concepts behind Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API)
- [AudioWorkletProcessor.process()](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process)


