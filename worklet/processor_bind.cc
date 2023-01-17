#include <emscripten/bind.h>
#include "AudioProcessor.h"

using namespace emscripten;

class AudioProcessorWrapper : public AudioProcessor
{
public:
  AudioProcessorWrapper(int32_t sample_rate) : AudioProcessor(sample_rate) {}

  void render(uintptr_t output_ptr, int32_t num_frames)
  {
    // Use type cast to hide the raw pointer in function arguments.
    float *output_buffer = reinterpret_cast<float *>(output_ptr);
    AudioProcessor::render(output_buffer, num_frames);
  }
};

EMSCRIPTEN_BINDINGS(CLASS_AudioProcessor)
{
  // Don't double bind the process method... that was my mistake
  // When using specific methods of the base class bind those at that time.
  class_<AudioProcessor>("AudioProcessorBase")
      .constructor<float>()
      .function("render", &AudioProcessor::render, allow_raw_pointers())
      .function("triggerAttackRelease", &AudioProcessor::triggerAttackRelease);

  class_<AudioProcessorWrapper, base<AudioProcessor>>("AudioProcessor")
      .constructor<int32_t>()
      .function("render", &AudioProcessorWrapper::render, allow_raw_pointers());
}
