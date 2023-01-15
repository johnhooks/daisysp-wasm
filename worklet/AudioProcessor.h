#pragma once

#include <assert.h>
#include "daisysp.h"

const unsigned kRenderQuantumFrames = 128;
const unsigned kBytesPerChannel = kRenderQuantumFrames * sizeof(float);

class AudioProcessor
{
public:
  AudioProcessor(float sample_rate);
  void process(float *input, float *output, unsigned channel_count);

private:
  daisysp::Oscillator osc;
};
