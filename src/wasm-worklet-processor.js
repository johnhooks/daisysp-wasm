import Module from "./AudioProcessor.js";
import { RENDER_QUANTUM_FRAMES, HeapAudioBuffer } from "./wasm-audio-helper.js";

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
      this._heapOutputBuffer = new HeapAudioBuffer(
        mod,
        RENDER_QUANTUM_FRAMES,
        1,
        1
      );
      this._processor = new mod.AudioProcessor(48000);
      this._initialized = true;
    }).catch(error => { throw error })

		this.port.onmessage = this._handleMessage;
	}

	/**
	 * System-invoked process callback function.
	 * @param  {Array} inputs Incoming audio stream.
	 * @param  {Array} outputs Outgoing audio stream.
	 * @param  {Object} parameters AudioParam data.
	 * @return {Boolean} Active source flag.
	 */
	process(_inputs, outputs, _parameters) {
    // @todo remove hack
    if (!this._initialized) return true;

		// The output buffer (mono) provided by Web Audio API.
		const outputBuffer = outputs[0][0];

		// Call the render function to write into the WASM buffer. Then clone the
    // rendered data in the first channel to process() callback's output
    // buffer.
    this._processor.render(this._heapOutputBuffer.getHeapAddress(), RENDER_QUANTUM_FRAMES);
    outputBuffer.set(this._heapOutputBuffer.getChannelData(0));

		return true;
	}

	_handleMessage = (event) => {
		if (!this._initialized) return;
		if (event?.data && event?.data?.type) {
			if (event.data.type === "trigger") {
    		this._processor.triggerAttackRelease(event.data?.note ?? 60);
			}
		}
  }
}

registerProcessor("wasm-worklet-processor", WASMWorkletProcessor);
