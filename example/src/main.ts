import "./style.css";

import { Keyboard, Toggle } from "midi-kbd";

import { SimpleSynth } from "./simple-synth.js";

document.addEventListener("DOMContentLoaded", () => {
	const root = document.querySelector<HTMLDivElement>("#app");
	if (!root) throw new Error("root element #app is missing");

	customElements.define("kbd-ui", Keyboard);
	customElements.define("kbd-toggle", Toggle);
	customElements.define("kbd-demo", SimpleSynth);

	const demoEl = document.createElement("kbd-demo");
	root.appendChild(demoEl);
});
