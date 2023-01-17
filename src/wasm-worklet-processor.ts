import type { Message } from "./types.js";
import { createWasmBinding, type WasmBinding } from "./wasm-binding.js";

/**
 * A simple demonstration of WASM-powered AudioWorkletProcessor.
 *
 * @class WASMWorkletProcessor
 * @extends AudioWorkletProcessor
 */
class WasmWorkletProcessor extends AudioWorkletProcessor {
	private wasm: WasmBinding | undefined;

	/**
	 * @constructor
	 */
	constructor() {
		super();

		createWasmBinding()
			.then((binding) => (this.wasm = binding))
			.catch((error) => {
				throw error;
			});

		this.port.onmessage = this._handleMessage;
	}

	/**
	 * System-invoked process callback function.
	 * @param _inputs Incoming audio stream.
	 * @param outputs Outgoing audio stream.
	 * @param _parameters AudioParam data.
	 * @return Active source flag.
	 */
	process(_inputs: Float32Array[][], outputs: Float32Array[][] /* _parameters */): boolean {
		if (!this.wasm) return true;

		// The output buffer (mono) provided by Web Audio API.
		const outputBuffer = outputs[0][0];

		// Call the render function to write into the WASM buffer. Then clone the
		// rendered data in the first channel to process() callback's output
		// buffer.
		const channelData = this.wasm.render();

		if (channelData) outputBuffer.set(channelData);

		return true;
	}

	_handleMessage = (event: MessageEvent<Message>) => {
		if (!this.wasm) return;
		if (event.data.type === "trigger") {
			this.wasm.triggerAttackRelease(event.data.note);
		}
	};
}

registerProcessor("wasm-worklet-processor", WasmWorkletProcessor);
