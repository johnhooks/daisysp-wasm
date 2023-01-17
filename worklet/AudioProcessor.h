#pragma once

#include <assert.h>
#include "daisysp.h"

const unsigned kRenderQuantumFrames = 128;
const unsigned kBytesPerChannel = kRenderQuantumFrames * sizeof(float);

class AudioProcessor
{
public:
  AudioProcessor(float sample_rate);
  void render(float *output, int32_t num_frames);
  void triggerAttackRelease(uint8_t note);

private:
  daisysp::Oscillator osc;
  daisysp::AdEnv env;
};
