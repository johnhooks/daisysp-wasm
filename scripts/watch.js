#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { watch as rollupWatch } from "rollup";
import { loadConfigFile } from "rollup/dist/loadConfigFile.js";

import { watch } from "chokidar";

import { exec, Task } from "./utils/index.js";

const rootDir = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../");
const cppFileGlob = path.join(rootDir, "worklet", "*.{cc,h}");
const cmakeListsPath = path.join(rootDir, "CMakeLists.txt");
const makefilePath = path.join(rootDir, "build", "Makefile");

const emcmake = new Task("emcmake", ["cmake", "-B", "./build", "-S", "./"]);
const make = new Task("make", [], { cwd: path.join(rootDir, "build") });

/** @type {import("chokidar").WatchOptions} */
const watchOptions = {
	ignored: /(^|[\/\\])\../, // ignore dotfiles
	interval: 1000,
	persistent: true,
};

const { options: rollupOptions, warnings } = await loadConfigFile(
	path.join(rootDir, "rollup.config.js"),
	{
		format: "es",
	}
);

if (warnings.count > 0) {
	console.log(`rollup config has ${warnings.count} warnings`);
	// This prints all deferred warnings
	warnings.flush();
}

// Create the build directory if it doesn't exist.
await exec("mkdir", ["-p", "build"]);

const rollupWatcher = rollupWatch(rollupOptions);

/**
 * https://rollupjs.org/javascript-api/#rollup-watch
 * Note that when using watch mode via the JavaScript API, it is your responsibility
 * to call event.result.close() in response to the BUNDLE_END event to allow plugins
 * to clean up resources in the closeBundle hook.
 */
rollupWatcher.on("event", ({ result }) => {
	if (result) {
		result.close();
	}
});

const cmakeListsWatcher = watch(cmakeListsPath, watchOptions)
	.on("add", () => emcmake.run())
	.on("change", () => emcmake.run());

const cppWatcher = watch([makefilePath, cppFileGlob], watchOptions)
	.on("add", () => make.run())
	.on("change", () => make.run())
	.on("unlink", () => make.run());

process.on("SIGINT", () => {
	Promise.all([
		rollupWatcher.close(),
		cppWatcher.close(),
		cmakeListsWatcher.close(),
		emcmake.cancel(),
		make.cancel(),
	])
		.then(() => {
			process.exit(0);
		})
		.catch((error) => {
			throw error;
		});
});
