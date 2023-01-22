import { html, render } from "lit-html";
import { filterKeyboardEvents, keyEvents, mapToMidiEvent, type ToggleEvent } from "midi-kbd";
import type { Subscription } from "rxjs";

export class SimpleSynth extends HTMLElement {
	// Web Audio
	private _context: AudioContext | null = null;
	private _audioNode: AudioWorkletNode | null = null;
	private _volumeNode: GainNode | null = null;

	// UI Elements
	private _renderRoot: ShadowRoot;

	private _keyEventSubscription: Subscription;

	constructor() {
		super();
		this._renderRoot = this.attachShadow({ mode: "open" });

		this._keyEventSubscription = keyEvents
			.pipe(filterKeyboardEvents())
			.pipe(mapToMidiEvent(4))
			.subscribe((event) => {
				if (event.type === "on") {
					this._audioNode?.port.postMessage({ type: "trigger", note: event.midi });
				}
			});

		this._update();
	}

	private _update() {
		render(this._template(), this._renderRoot, { host: this });
	}

	private async _handleToggle(state: boolean) {
		if (this._context === null) await this._initializeAudio();
		if (state) {
			this._context?.resume();
		} else {
			this._context?.suspend();
		}
	}

	private async _initializeAudio() {
		const workletUrl = import.meta.env.BASE_URL + "wasm-worklet-processor.js";
		this._context = new AudioContext({ sampleRate: 48_000 });
		await this._context.audioWorklet.addModule(workletUrl);
		this._audioNode = new AudioWorkletNode(this._context, "wasm-worklet-processor");
		this._volumeNode = new GainNode(this._context, { gain: 0.2 });
		this._audioNode.connect(this._volumeNode).connect(this._context.destination);
		console.log("audio initialized");
	}

	private _template() {
		const handleToggle = {
			handleEvent: (event: ToggleEvent) => {
				const toggled = event.detail.value;
				this._handleToggle(toggled);
			},
		};

		return html`
			<style>
				label {
					color: var(--medium-gray);
				}

				.wrapper {
					display: flex;
					flex-direction: column;
					justify-content: center;
					gap: 1rem;
				}

				.justify-center {
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
					gap: 1rem;
				}
			</style>
			<div class="wrapper">
				<div class="justify-center">
					<kbd-toggle id="toggle" @toggle=${handleToggle}></kbd-toggle>
					<label for="toggle">Enable Audio</label>
				</div>
				<kbd-ui></kbd-ui>
			</div>
		`;
	}

	disconnectedCallback() {
		this._keyEventSubscription.unsubscribe();
	}
}
