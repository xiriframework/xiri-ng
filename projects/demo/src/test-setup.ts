// jsdom lacks these browser APIs; the demo pages use them through ThemeService, BreakpointObserver and Layout.
Object.defineProperty( window, 'matchMedia', {
	writable: true,
	value: ( query: string ): MediaQueryList => ( {
		matches: false,
		media: query,
		onchange: null,
		addEventListener: () => undefined,
		removeEventListener: () => undefined,
		addListener: () => undefined,
		removeListener: () => undefined,
		dispatchEvent: () => false,
	} ),
} );

class NoopIntersectionObserver {
	readonly root = null;
	readonly rootMargin = '';
	readonly thresholds: number[] = [];
	observe(): void { return undefined; }
	unobserve(): void { return undefined; }
	disconnect(): void { return undefined; }
	takeRecords(): IntersectionObserverEntry[] { return []; }
}
globalThis.IntersectionObserver ??= NoopIntersectionObserver as unknown as typeof IntersectionObserver;
