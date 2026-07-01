import {
	AfterViewInit,
	Component,
	computed,
	DestroyRef,
	effect,
	ElementRef,
	inject,
	input,
	NgZone,
	OnDestroy,
	output,
	signal,
	viewChild,
	ViewEncapsulation
} from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { XiriColor } from '../types/color.type';
import { XiriEchartsCallbackParams } from './params';

/** Payload emitted when a chart data item (bar, slice, point, …) is clicked. */
export interface XiriEchartsClick {
	componentType: string;   // 'series' for a data-point click
	seriesType: string;
	seriesIndex: number;
	dataIndex: number;
	name: string;
	value: unknown;
}

/** Minimal structural view of the echarts instance methods the host uses. */
interface XiriEchartsInstance {
	on( event: string, handler: ( params: XiriEchartsCallbackParams ) => void ): void;
	setOption( option: unknown, notMerge?: boolean ): void;
	resize(): void;
	dispose(): void;
}

/** Minimal structural view of the lazily-imported echarts module. */
interface XiriEchartsModule {
	init( el: HTMLElement ): XiriEchartsInstance;
}

/**
 * `xiri-echarts-host` — shared echarts plumbing for all chart components.
 *
 * Handles lazy `import('echarts')`, init / setOption / dispose, ResizeObserver,
 * the optional mat-card surface (with header + compact mode), and a flat
 * variant when nested inside another card.
 *
 * Specialized chart components (`xiri-barchart`, `xiri-linechart`, …) build
 * a typed echarts option from their settings and feed it via the `option`
 * input. Each re-emit of `option` re-renders the chart with `setOption(option, true)`.
 *
 * Compact-Mode strips the outer mat-card so the chart sits flat inside an
 * outer xiri-card without card-in-card visuals.
 */
@Component( {
	selector: 'xiri-echarts-host',
	templateUrl: './echarts-host.component.html',
	styleUrl: './echarts-host.component.scss',
	encapsulation: ViewEncapsulation.None,
	imports: [ MatCard, MatCardContent, MatIcon ],
	host: { '[class.compact]': 'compact()' }
} )
export class XiriEchartsHostComponent implements AfterViewInit, OnDestroy {

	option = input.required<unknown>();
	compact = input<boolean>( false );
	title = input<string | undefined>( undefined );
	headerIcon = input<string | undefined>( undefined );
	headerIconColor = input<XiriColor | undefined>( undefined );
	chartHeight = input<string>( '200px' );

	// Emitted when a data item (bar, slice, point, …) is clicked.
	itemClick = output<XiriEchartsClick>();

	chartHostRef = viewChild.required<ElementRef<HTMLDivElement>>( 'chartHost' );

	private zone = inject( NgZone );
	private destroyRef = inject( DestroyRef );

	private chart: XiriEchartsInstance | null = null;
	private echarts: XiriEchartsModule | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private loadError = signal<string | null>( null );

	readonly error = this.loadError.asReadonly();
	readonly hasHeader = computed( () => !!( this.title() || this.headerIcon() ) );

	constructor() {
		effect( () => {
			// Re-render whenever the option changes.
			this.option();
			if ( this.chart ) {
				this.render();
			}
		} );
	}

	async ngAfterViewInit(): Promise<void> {
		try {
			this.echarts = await import( 'echarts' ) as unknown as XiriEchartsModule;
		} catch {
			this.loadError.set( 'echarts is not installed. Add `npm install echarts` to your app.' );
			return;
		}

		this.zone.runOutsideAngular( () => {
			this.chart = this.echarts!.init( this.chartHostRef().nativeElement );

			this.chart.on( 'click', ( p: XiriEchartsCallbackParams ) => {
				if ( p.componentType !== 'series' )
					return;
				this.zone.run( () => this.itemClick.emit( {
					componentType: p.componentType,
					seriesType: p.seriesType,
					seriesIndex: p.seriesIndex,
					dataIndex: p.dataIndex,
					name: p.name,
					value: p.value,
				} ) );
			} );

			this.render();

			this.resizeObserver = new ResizeObserver( () => this.chart?.resize() );
			this.resizeObserver.observe( this.chartHostRef().nativeElement );
		} );

		this.destroyRef.onDestroy( () => this.dispose() );
	}

	ngOnDestroy(): void {
		this.dispose();
	}

	private dispose(): void {
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
		this.chart?.dispose();
		this.chart = null;
	}

	private render(): void {
		if ( !this.chart ) return;
		const opt = this.option();
		if ( !opt ) return;
		this.chart.setOption( opt, true );
	}
}
