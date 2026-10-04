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

// Once echarts is loaded, a later test in the same file inits charts before teardown: give them a 2D context
// that swallows every call, and a ResizeObserver that never fires.
const ctx2d: CanvasRenderingContext2D = new Proxy( {} as Record<string | symbol, unknown>, {
	get: ( target, prop ) => prop in target ? target[ prop ]
		: prop === 'measureText' ? ( text: string ) => ( { width: text.length * 7 } )
		: () => ctx2d,
	set: ( target, prop, value ) => {
		target[ prop ] = value;
		return true;
	},
} ) as unknown as CanvasRenderingContext2D;
HTMLCanvasElement.prototype.getContext = ( () => ctx2d ) as unknown as HTMLCanvasElement[ 'getContext' ];

class NoopResizeObserver {
	observe(): void { return undefined; }
	unobserve(): void { return undefined; }
	disconnect(): void { return undefined; }
}
globalThis.ResizeObserver ??= NoopResizeObserver as unknown as typeof ResizeObserver;
