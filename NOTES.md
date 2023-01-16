## Changes to maybe walk back
- changed from relative import of DaisySP, seems to be working.
  ```cpp
  #include "../DaisySP/Source/daisysp.h"`
  // to
  #include "daisysp.h"
  ```

## Emscripten configuration

This compile flag needs to be set `-s ASSERTIONS=0`, otherwise the checks to verify the runtime environment fail. It doesn't recognize an audio worklet environment.

- `EXPORT_ES6` - wraps the wasm module an async iife and exports it as default. So it has to be called and awaited. It seems to be a method of allowing configuration of the module, an config object can passed as an argument and it is used as the base object of the module.

**flags to research**

I haven't found good documentation for the `emcc` compile options, but searching through [emcc.py](https://github.com/emscripten-core/emscripten/blob/fa1abe47957df0dc336b597c2543006e3e647a64/emcc.py) seems to uncover them.

- `MODULARIZE`

## `allow_raw_pointers`

In the Google examples they don't pass `allow_raw_pointers` as the third argument to the base class binding, but it won't compile for me unless I do.

```cpp
EMSCRIPTEN_BINDINGS(CLASS_Synthesizer) {
  // First, bind the original Synthesizer class.
  class_<Synthesizer>("SynthesizerBase")
      .constructor<int32_t>()
      .function("noteOff", &Synthesizer::noteOff)
      .function("noteOn", &Synthesizer::noteOn);

  // Then expose the overridden `render` method from the wrapper class.
  class_<SynthesizerWrapper, base<Synthesizer>>("Synthesizer")
      .constructor<int32_t>()
      .function("render", &SynthesizerWrapper::render, allow_raw_pointers());
}
```

It was because I double binding the `precess` method.

```cpp
EMSCRIPTEN_BINDINGS(CLASS_AudioProcessor)
{
  // Don't double bind the process method... that was my mistake
  // When using specific methods of the base class bind those at that time.
  class_<AudioProcessor>("AudioProcessorBase")
      .constructor<float>()
      .function("process", &AudioProcessor::process, allow_raw_pointers());

  class_<AudioProcessorWrapper, base<AudioProcessor>>("AudioProcessor")
      .constructor<int32_t>()
      .function("process", &AudioProcessorWrapper::process, allow_raw_pointers());
}
```

It should just be:

```cpp
EMSCRIPTEN_BINDINGS(CLASS_AudioProcessor)
{
  class_<AudioProcessorWrapper, base<AudioProcessor>>("AudioProcessor")
      .constructor<int32_t>()
      .function("process", &AudioProcessorWrapper::process, allow_raw_pointers());
}
```
