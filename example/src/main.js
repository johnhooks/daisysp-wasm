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
		this._toggleButton.addEventListener("mouseup", () => this._handleToggle());
		this._toneButton = document.getElementById("play-tone");
		this._toneButton.addEventListener("mousedown", () => this._handleToneButton(true));
		this._toneButton.addEventListener("mouseup", () => this._handleToneButton(false));
		this._toggleButton.disabled = false;
		this._toneButton.disabled = false;
	}

	async initializeAudio() {
		// if (this._initialized) return;
		this._context = new AudioContext();
		await this._context.audioWorklet.addModule("wasm-worklet-processor.js");
		this._audioNode = new AudioWorkletNode(this._context, "wasm-worklet-processor");

		const oscillator = new OscillatorNode(this._context);

		this._volumeNode = new GainNode(this._context, { gain: 0.25 });
		oscillator
			.connect(this._audioNode)
			.connect(this._volumeNode)
			.connect(this._context.destination);

		oscillator.start();

		if (!this._toggleState) this._context.suspend();
	}

	async _handleToggle() {
		this._toggleState = !this._toggleState;
		if (this._toggleState) {
			await demoApp.initializeAudio();
			this._context.resume();
			this._toggleButton.classList.replace("inactive", "active");
		} else {
			this._context.suspend();
			this._toggleButton.classList.replace("act`ive", "inactive");
		}
	}

	_handleToneButton(isDown) {
		this._audioNode.port.postMessage(isDown);
		if (isDown) {
			this._toneButton.classList.replace("inactive", "active");
		} else {
			this._toneButton.classList.replace("active", "inactive");
		}
	}
}

const demoApp = new DemoApp();

window.addEventListener("load", () => {
	demoApp.initializeView();
});

export {};
