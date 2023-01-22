#include "AudioProcessor.h"

using namespace daisysp;

// Example similar to the DaisySeed Osc Example.
// https://github.com/electro-smith/DaisyExamples/blob/d15ccc69b689a76b220aed8113615e9c77eb1b39/seed/Osc/Osc.cpp

/**
 * @brief Construct a new Audio Processor:: Audio Processor object
 *
 * @param sample_rate - The sample rate of the JavaScript AudioContext
 */
AudioProcessor::AudioProcessor(float sample_rate)
{
	assert(sample_rate > 0);

	// Setup the oscillator
	osc.Init(sample_rate); // int32_t cast to float done in the emscripten wrapper class
	osc.SetWaveform(Oscillator::WAVE_SQUARE);
	osc.SetAmp(1.f);
	osc.SetFreq(mtof(60));

	// Setup the volume envelope
	env.Init(sample_rate);
	// Envelope attack and decay times
	env.SetTime(ADENV_SEG_ATTACK, .01);
	env.SetTime(ADENV_SEG_DECAY, .4);
	// minimum and maximum envelope values
	env.SetMin(0.0);
	env.SetMax(1.f);
	env.SetCurve(0); // linear
}

/**
 * @brief Render a series of AudioBuffer frames.
 *
 * @param output - The pointer to the AudioWorkletProcessor output Float32Array on the WASM heap.
 * @param num_frames - The number for frames to render. AudioContext default is 128.
 */
void AudioProcessor::render(float *output, int32_t num_frames)
{
	float osc_out, env_out;

	for (size_t i = 0; i < num_frames; i++)
	{
		// Get the next envelope value
		env_out = env.Process();
		// Set the oscillator volume to the latest env value
		osc.SetAmp(env_out);
		// Get the next oscillator sample
		osc_out = osc.Process();
		// Set mono output
		*output++ = osc_out;
	}
}

void AudioProcessor::triggerAttackRelease(uint8_t note)
{
	osc.SetFreq(mtof(note));
	env.Trigger();
}
