// Minimal demo service placeholder to satisfy imports during development.
// Some parts of the app import `DemoService` but this project doesn't
// require a full implementation. Export a small, safe API to avoid runtime
// import errors.

type DemoListener = (active: boolean) => void;

// Minimal demo service placeholder to satisfy imports during development.
// Some parts of the app import `DemoService`. Provide a small, safe API
// that matches Sidebar expectations: isActive() and toggleDemo().
export const DemoService = {
	_active: false as boolean,
	_listeners: new Set<DemoListener>(),

	getMessage(): string {
		return 'Demo service placeholder';
	},

	isActive(): boolean {
		return this._active;
	},

	toggleDemo(): void {
		this._active = !this._active;
		// notify listeners
		for (const l of this._listeners) {
			try { l(this._active); } catch (e) { /* swallow listener errors */ }
		}
	},

	// Optional: allow components to listen for demo mode changes
	subscribe(cb: DemoListener) {
		this._listeners.add(cb);
		return () => this._listeners.delete(cb);
	}
};

export default DemoService;
