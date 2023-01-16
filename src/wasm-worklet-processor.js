import Module from "./AudioProcessor.js";
import { RENDER_QUANTUM_FRAMES, MAX_CHANNEL_COUNT, HeapAudioBuffer } from "./wasm-audio-helper.js";

/**
 * A simple demonstration of WASM-powered AudioWorkletProcessor.
 *
 * @class WASMWorkletProcessor
 * @extends AudioWorkletProcessor
 */
class WASMWorkletProcessor extends AudioWorkletProcessor {
  _initialized = false;
  _processor = null;

	/**
	 * @constructor
	 */
	constructor() {
		super();

    Module().then(mod => {
      // Allocate the buffer for the heap access. Start with stereo, but it can
		  // be expanded up to 32 channels.
      this._heapInputBuffer = new HeapAudioBuffer(
        mod,
        RENDER_QUANTUM_FRAMES,
        2,
        MAX_CHANNEL_COUNT
      );
      this._heapOutputBuffer = new HeapAudioBuffer(
        mod,
        RENDER_QUANTUM_FRAMES,
        2,
        MAX_CHANNEL_COUNT
      );
      this._processor = new mod.AudioProcessor(48000);
      this._initialized = true;
    }).catch(error => { throw error })
	}

	/**
	 * System-invoked process callback function.
	 * @param  {Array} inputs Incoming audio stream.
	 * @param  {Array} outputs Outgoing audio stream.
	 * @param  {Object} parameters AudioParam data.
	 * @return {Boolean} Active source flag.
	 */
	process(inputs, outputs, parameters) {
    // @todo remove hack
    if (!this._initialized) return true;

		// Use the 1st input and output only to make the example simpler. |input|
		// and |output| here have the similar structure with the AudioBuffer
		// interface. (i.e. An array of Float32Array)
		const input = inputs[0];
		const output = outputs[0];

		// For this given render quantum, the channel count of the node is fixed
		// and identical for the input and the output.
		const channelCount = input.length;

		// Prepare HeapAudioBuffer for the channel count change in the current
		// render quantum.
		this._heapInputBuffer.adaptChannel(channelCount);
		this._heapOutputBuffer.adaptChannel(channelCount);

		// Copy-in, process and copy-out.
		for (let channel = 0; channel < channelCount; ++channel) {
			this._heapInputBuffer.getChannelData(channel).set(input[channel]);
		}
		this._processor.process(
			this._heapInputBuffer.getHeapAddress(),
			this._heapOutputBuffer.getHeapAddress(),
			channelCount
		);
		for (let channel = 0; channel < channelCount; ++channel) {
			output[channel].set(this._heapOutputBuffer.getChannelData(channel));
		}

		return true;
	}
}

registerProcessor("wasm-worklet-processor", WASMWorkletProcessor);
