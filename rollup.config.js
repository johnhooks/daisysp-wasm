import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

/**@type {import('rollup').InputPluginOption} */
const plugins = [nodeResolve(), typescript()];

if (process.env.CI) {
	plugins.push(terser({ mangle: false }));
}

/** @type {import('rollup').RollupOptions} */
export default {
	input: "src/wasm-worklet-processor.ts",
	output: {
		file: "dist/wasm-worklet-processor.js",
		format: "es",
	},
	plugins,
};
