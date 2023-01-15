# WASM DaisySP AudioWorkletProcessor Example

## Goal

Web Audio Worklet that uses [DaisySP](https://github.com/electro-smith/DaisySP).

## Inputs and Outputs

### Ways to use inputs and outputs from JS audio worklet in C++

Google in their [example](https://github.com/GoogleChromeLabs/web-audio-samples/blob/eed2a8613af551f2b1d166a01c834e8431fdf3c6/src/audio-worklet/design-pattern/wasm/SimpleKernel.cc)
did it with raw pointers to a multi-channel `Float32Array`, but first the inputs and outputs are transformed
([source](https://github.com/johnhooks/web-audio-samples/blob/eed2a8613af551f2b1d166a01c834e8431fdf3c6/src/audio-worklet/design-pattern/lib/wasm-audio-helper.js)) into a WASM heap.

```cpp
 void Process(uintptr_t input_ptr, uintptr_t output_ptr, unsigned channel_count) {
    float* input_buffer = reinterpret_cast<float*>(input_ptr);
    float* output_buffer = reinterpret_cast<float*>(output_ptr);
}
```

**ref** [reinterpret_cast](https://en.cppreference.com/w/cpp/language/reinterpret_cast)

### Things to research

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


