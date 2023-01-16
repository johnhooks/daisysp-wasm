import nodeResolve from "@rollup/plugin-node-resolve";

/** @type {import('rollup').RollupOptions} */
export default {
	input: "src/wasm-worklet-processor.js",
	output: {
		file: "dist/wasm-worklet-processor.js",
		format: "es",
	},
	plugins: [nodeResolve()],
};
