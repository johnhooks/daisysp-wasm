/**
 * @typedef {import('node:child_process').ChildProcess} ChildProcess
 * @typedef {import('node:child_process').SpawnOptions} SpawnOptions
 * @typedef {Parameters<import('node:child_process').spawn>} TaskParams
 */

import { spawn } from "node:child_process";

/** @type {SpawnOptions} */
const defaultSpawnOptions = {
	stdio: ["ignore", "ignore", "inherit"],
	// stdio: "inherit",
};

/**
 * An asynchronous build task manager.
 *
 * @public
 */
export class Task {
	/**
	 * @type {ChildProcess | null}
	 * @private
	 */
	_proc;

	/**
	 * @type {TaskParams}
	 * @private
	 */
	_params;

	/**
	 * @type {AbortController | null}
	 * @private
	 */
	_abortController;

	/**
	 * @type {number}
	 * @protected
	 * */
	_rate = 500;

	/**
	 * @type {number}
	 * @protected
	 * */
	_last = 0;

	/**
	 * @type {number}
	 * @protected
	 */
	_start = 0;

	/**
	 * number | undefined;
	 * @type {ReturnType<typeof setTimeout> | undefined}
	 * @protected
	 * */
	_timeout; // number | undefined;

	/**
	 * @private
	 */
	_isRunning = false;

	/**
	 *
	 * @param {string} command - Shell command to execute.
	 * @param {readonly string[]} args - Command arguments.
	 * @param {SpawnOptions} options - Options to pass to `spawn`.
	 */
	constructor(command, args = [], options = {}) {
		this._params = [command, args, options];
	}

	/**
	 * Run the task.
	 *
	 * @returns {void}
	 * @public
	 */
	run() {
		// This is what debounces multiple calls.
		// It will execute the task after `_last + _rate < Date.now()`
		this._last = Date.now();
		// Clear a previously scheduled timeout if it exists.
		this._clearTimeout();
		this._scheduleRun();
	}

	/**
	 * Cancel the job.
	 *
	 * @returns {Promise<void>} Returns a Promise that resolves when the task is successfully cancelled.
	 * @public
	 */
	cancel() {
		return new Promise((resolve, reject) => {
			if (!this._isRunning) resolve();
			this._proc.on("close", () => resolve());
			this._proc.on("error", (error) => reject(error));
			this._abortController?.abort();
		});
	}

	/**
	 * Maybe execute the task or schedule the next tick.
	 *
	 * @returns {Promise<number>}
	 * @protected
	 */
	_scheduleRun() {
		// Wait to rerun a task until the previous run has completed.
		if (this._isRunning) {
			// console.log(`Task '${this._params[0]}' is already running, waiting to rerun`);
			this._scheduleTick(this._rate);
			return;
		}

		// Calculate how long since last tick
		const now = Date.now();
		const diff = now - this._last;

		// If `diff` is less than the rate, reschedule the next tick.
		if (diff < this._rate) {
			// console.log(`Rescheduling task '${this._params[0]}' in ${this._rate - diff}ms`);
			this._scheduleTick(this._rate - diff);
			return;
		}

		console.log(`Starting task '${this._params[0]}'`);
		this._run();
	}

	/**
	 * Schedule the next tick.
	 *
	 * @param {number | undefined} time - The number of milliseconds in which to schedule the next tick.
	 * @protected
	 */
	_scheduleTick(time) {
		const ms = time ?? this._rate;

		// Schedule the next tick.
		this._timeout = setTimeout(() => {
			this._scheduleRun();
		}, ms);
	}

	/**
	 * Clear the time out if it exists.
	 *
	 * @returns {void}
	 * @protected
	 */
	_clearTimeout() {
		if (!this._timeout) return;
		clearTimeout(this._timeout);
		this._timeout = void 0;
	}

	/**
	 * Internal run method.
	 *
	 * @returns {void}
	 * @protected
	 */
	_run() {
		this._start = Date.now();

		const [command, args, options] = this._params;
		const proc = spawn(command, args, { ...defaultSpawnOptions, ...options });
		const onExit = () => proc.kill("SIGINT");
		const onError = (error) => {
			throw error;
		};
		const onClose = (code) => {
			if (code === 0) {
				this._isRunning = false;
				this._proc = void 0;
				const seconds = Math.floor((Date.now() - this._start) / 100) / 10;
				console.log(`Task '${this._params[0]}' completed in ${seconds}s`);
			} else if (code) {
				const [command, args] = this._params;
				const task = command + (args.length > 1 ? " " + args.join(" ") : "");
				throw new Error(`Task '${task}' exited with code: ${code}`);
			}
		};

		const onAbort = () => {
			proc.removeListener(onClose);
			proc.on("close", () => {
				this._isRunning = false;
				this._proc = void 0;
			});
			proc.proc.kill("SIGTERM");
			this._abortController.signal.removeEventListener(onAbort);
		};

		proc.on("error", onError);
		proc.on("close", onClose);

		// Kill the child process if the main current process exits.
		process.on("SIGINT", onExit);
		process.on("SIGTERM", onExit);

		this._abortController = new AbortController();
		this._abortController.signal.addEventListener("abort", onAbort);

		this._proc = proc;
	}
}
