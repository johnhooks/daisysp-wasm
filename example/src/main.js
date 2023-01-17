class DemoApp {
	constructor() {
		this._container = null;
		this._toggleButton = null;
		this._toggleState = false;
		this._toneButton = null;
		this._context = null;
		this._audioNode = null;
		this._volumeNode = null;
		this._initialized = false;
	}

	initializeView() {
		this._toggleButton = document.getElementById("audio-toggle");
		this._toggleButton?.addEventListener("mouseup", () => this._handleToggle());
		this._toneButton = document.getElementById("play-tone");
		this._toneButton?.addEventListener("mousedown", () => this._handleToneButton(true));
		this._toneButton?.addEventListener("mouseup", () => this._handleToneButton(false));
		this._toggleButton.disabled = false;
		this._toneButton.disabled = false;
	}

	async initializeAudio() {
		console.log(import.meta.env);
		const workletUrl = import.meta.env.BASE_URL + "wasm-worklet-processor.js";
		this._context = new AudioContext({ sampleRate: 48_000 });
		await this._context.audioWorklet.addModule(workletUrl);
		this._audioNode = new AudioWorkletNode(this._context, "wasm-worklet-processor");
		this._volumeNode = new GainNode(this._context, { gain: 0.25 });

		this._audioNode.connect(this._volumeNode).connect(this._context.destination);
	}

	async _handleToggle() {
		if (!this._initialized) await this.initializeAudio();
		// Take the logic from the initializeAudio and put it here.
		// On toggle trigger attack release with message like { type: "trigger", note: 80} using MIDI note values.
		this._toggleState = !this._toggleState;
		if (this._toggleState) {
			this._context?.resume();

			this._toggleButton?.classList.replace("inactive", "active");
		} else {
			this._context?.suspend();
			this._toggleButton?.classList.replace("act`ive", "inactive");
		}
	}

	/**
	 *
	 * @param {boolean} isDown
	 */
	_handleToneButton(isDown) {
		if (isDown) {
			this._audioNode?.port.postMessage({ type: "trigger", note: 70 });
			this._toneButton?.classList.replace("inactive", "active");
		} else {
			this._toneButton?.classList.replace("active", "inactive");
		}
	}
}

const demoApp = new DemoApp();

window.addEventListener("load", () => {
	demoApp.initializeView();
});

export {};
