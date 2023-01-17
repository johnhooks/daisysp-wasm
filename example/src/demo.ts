class Demo extends HTMLElement {
	// Web Audio
	private context: AudioContext | null = null;
	private audioNode: AudioWorkletNode | null = null;
	private volumeNode: GainNode | null = null;

	// DOM User Interface
	private toggleButton: HTMLButtonElement;
	private toneButton: HTMLButtonElement;
	private toggleState = false;

	constructor() {
		// Always call super first in constructor
		super();

		// Create a shadow root
		const shadow = this.attachShadow({ mode: "open" });

		// Create some CSS to apply to the shadow dom
		const style = document.createElement("style");

		style.textContent = /* css */ `
      .wrapper {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1rem;
      }

      button {
        background-color: var(--violet);
        color: var(--dark-violet);
        border-radius: 12px;
        border-width: 1.5px;
        border-style: solid;
        border-color: var(--dark-violet);
        padding-top: .5rem;
        padding-left: .75rem;
        padding-bottom: .5rem;
        padding-right: .75rem;

        transition-property: color, background-color;
        transition-duration: 100ms;
      }

      button:disabled {
        background-color: var(--light-gray);
        color: var(--medium-gray);
        border-color: var(--medium-gray);
      }

      button:hover:not([disabled]) {
        color: var(--dark-blue);
      }

      button:active:not([disabled]) {
        color: var(--dark-blue);
        background-color: var(--dark-violet);
      }

			button.active {
				color: var(--dark-blue);
        background-color: var(--dark-violet);
			}
    `;

		// Create text node and add word count to it
		const wrapper = document.createElement("div");
		wrapper.classList.add("wrapper");

		const toggleButton = document.createElement("button");
		// prettier-ignore
		toggleButton.innerHTML = /* svg */`<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" /></svg>`
		toggleButton.addEventListener("click", () => this.handleToggle());
		this.toggleButton = toggleButton;

		const toneButton = document.createElement("button");
		// prettier-ignore
		toneButton.innerHTML = /* svg */ `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>`
		toneButton.classList.add("inactive");
		toneButton.disabled = true;
		toneButton.addEventListener("mousedown", () => this.handleToneButton(true));
		toneButton.addEventListener("mouseup", () => this.handleToneButton(false));
		this.toneButton = toneButton;

		shadow.appendChild(style);
		shadow.appendChild(wrapper);
		wrapper.appendChild(toggleButton);
		wrapper.appendChild(toneButton);
	}

	async handleToggle() {
		if (this.context === null) await this.initializeAudio();
		this.toggleState = !this.toggleState;
		if (this.toggleState) {
			this.context?.resume();
			this.toneButton.disabled = false;
			this.toggleButton.classList.add("active");
		} else {
			this.context?.suspend();
			this.toneButton.disabled = true;
			this.toggleButton.classList.remove("active");
		}
	}

	private handleToneButton(isDown: boolean) {
		if (isDown) {
			this.audioNode?.port.postMessage({ type: "trigger", note: 70 });
		}
	}

	private async initializeAudio() {
		const workletUrl = import.meta.env.BASE_URL + "wasm-worklet-processor.js";
		this.context = new AudioContext({ sampleRate: 48_000 });
		await this.context.audioWorklet.addModule(workletUrl);
		this.audioNode = new AudioWorkletNode(this.context, "wasm-worklet-processor");
		this.volumeNode = new GainNode(this.context, { gain: 0.25 });
		this.audioNode.connect(this.volumeNode).connect(this.context.destination);
	}
}

customElements.define("wasm-demo", Demo);

export {};
