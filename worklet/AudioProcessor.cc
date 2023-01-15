#include "AudioProcessor.h"

using namespace daisysp;

// void AudioProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
// void AudioProcessor::prepareToPlay(double sampleRate)
// {
// 	osc.Init(sampleRate);
// 	noteMidi = 0.0f;
// 	noteVal = 0.f;
// 	ratio = 2.f;
// 	index = 0.1f;
// }

AudioProcessor::AudioProcessor(float sample_rate)
{
	assert(sample_rate > 0);
	osc.SetWaveform(Oscillator::WAVE_SQUARE);
	// int32_t cast to float done in the emscripten wrapper class
	osc.Init(sample_rate);
}

void AudioProcessor::process(float *input, float *output, unsigned channel_count)
{
	// Bypasses the data. By design, the channel count will always be the same
	// for |input_buffer| and |output_buffer|.
	for (unsigned channel = 0; channel < channel_count; ++channel)
	{
		float *destination = output + channel * kRenderQuantumFrames;
		float *source = input + channel * kRenderQuantumFrames;
		memcpy(destination, source, kBytesPerChannel);
	}
}
// void AudioProcessor::processBlock(juce::AudioBuffer<float> &buffer,
// 																	juce::MidiBuffer &midiMessages)
// {
// 	juce::ignoreUnused(midiMessages);

// 	juce::ScopedNoDenormals noDenormals;
// 	auto totalNumInputChannels = getTotalNumInputChannels();
// 	auto totalNumOutputChannels = getTotalNumOutputChannels();

// 	// In case we have more outputs than inputs, this code clears any output
// 	// channels that didn't contain input data, (because these aren't
// 	// guaranteed to be empty - they may contain garbage).
// 	// This is here to avoid people getting screaming feedback
// 	// when they first compile a plugin, but obviously you don't need to keep
// 	// this code if your algorithm always overwrites all the output channels.
// 	for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
// 		buffer.clear(i, 0, buffer.getNumSamples());

// 	// Handle some MIDI
// 	int time;
// 	juce::MidiMessage m;
// 	for (juce::MidiBuffer::Iterator i(midiMessages); i.getNextEvent(m, time);)
// 	{
// 		if (m.isNoteOn())
// 		{
// 			noteMidi = m.getNoteNumber();
// 		}
// 		else if (m.isController())
// 		{
// 			switch (m.getControllerNumber())
// 			{
// 			case 1:
// 				index = (m.getControllerValue() / 127.f);
// 				break;
// 			case 2:
// 			case 91: // 91 is the first CC knob on the old oxygen8 v2 I have sitting here...
// 				ratio = 1.f + ((m.getControllerValue() / 127.f) * 11.f);
// 				break;
// 			default:
// 				break;
// 			}
// 		}
// 	}

// 	float note = daisysp::fclamp(noteMidi + noteVal, 0.0, 127.0);
// 	osc.SetIndex(index);
// 	osc.SetRatio(ratio);
// 	// Process loop
// 	for (int channel = 0; channel < totalNumInputChannels; ++channel)
// 	{
// 		auto *channelData = buffer.getWritePointer(channel);
// 		juce::ignoreUnused(channelData);
// 		// ..do something to the data...
// 		osc.SetFrequency(daisysp::mtof(note));
// 		if (channel == 0)
// 		{
// 			for (size_t i = 0; i < buffer.getNumSamples(); i++)
// 			{
// 				channelData[i] = osc.Process();
// 			}
// 		}
// 	}
// }
