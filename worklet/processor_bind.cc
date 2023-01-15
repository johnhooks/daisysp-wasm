#include <emscripten/bind.h>
#include "AudioProcessor.h"

using namespace emscripten;

class AudioProcessorWrapper : public AudioProcessor
{
public:
  AudioProcessorWrapper(int32_t sample_rate) : AudioProcessor(sample_rate) {}

  // void process(uintptr_t input_ptr, uintptr_t output_ptr, int32_t num_frames)
  void process(uintptr_t input_ptr, uintptr_t output_ptr, unsigned channel_count)
  {
    // Use type cast to hide the raw pointer in function arguments.
    float *input_buffer = reinterpret_cast<float *>(input_ptr);
    float *output_buffer = reinterpret_cast<float *>(output_ptr);
    AudioProcessor::process(input_buffer, output_buffer, channel_count);
  }
};

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

/*
// Google synth worklet example bindings
EMSCRIPTEN_BINDINGS(CLASS_Synthesizer)
{
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

 */
