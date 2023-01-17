import Module from "./AudioProcessor.js";

import type { AudioProcessor, DspModule } from "./types.js";
import { RENDER_QUANTUM_FRAMES, HeapAudioBuffer } from "./wasm-audio-helper.js";

export class WasmBinding {
	readonly processor: AudioProcessor;
	readonly heapOutputBuffer: HeapAudioBuffer;

	constructor(mod: DspModule) {
		this.heapOutputBuffer = new HeapAudioBuffer(mod, RENDER_QUANTUM_FRAMES, 1, 1);
		this.processor = new mod.AudioProcessor(48000);
	}

	render(): Float32Array | undefined {
		this.processor.render(this.heapOutputBuffer.getHeapAddress(), RENDER_QUANTUM_FRAMES);
		return this.heapOutputBuffer.getChannelData(0);
	}

	triggerAttackRelease(note: number): void {
		this.processor.triggerAttackRelease(note);
	}
}

export async function createWasmBinding(): Promise<WasmBinding> {
	try {
		const mod = (await Module()) as DspModule;
		return new WasmBinding(mod);
	} catch (error) {
		throw error;
	}
}
