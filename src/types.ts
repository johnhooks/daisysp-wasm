export interface AudioProcessor {
	render(output: number, num_frames: number): void;
	triggerAttackRelease(note: number): void;
}

interface AudioProcessorCtor {
	new (sampleRate: number): AudioProcessor;
}

export type DspModule = EmscriptenModule & {
	AudioProcessor: AudioProcessorCtor;
};

export type TriggerMessage = {
	type: "trigger";
	note: number;
};

export type Message = TriggerMessage;
