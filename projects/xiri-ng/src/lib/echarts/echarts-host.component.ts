import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	effect,
	ElementRef,
	inject,
	input,
	NgZone,
	OnDestroy,
	signal,
	viewChild,
	ViewEncapsulation
} from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { XiriColor } from '../types/color.type';

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
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	imports: [ MatCard, MatCardContent, MatIcon ],
	host: { '[class.compact]': 'compact()' }
} )
export class XiriEchartsHostComponent implements AfterViewInit, OnDestroy {

	option = input.required<any>();
	compact = input<boolean>( false );
	title = input<string | undefined>( undefined );
	headerIcon = input<string | undefined>( undefined );
	headerIconColor = input<XiriColor | undefined>( undefined );
	chartHeight = input<string>( '200px' );

	chartHostRef = viewChild.required<ElementRef<HTMLDivElement>>( 'chartHost' );

	private zone = inject( NgZone );
	private destroyRef = inject( DestroyRef );

	private chart: any | null = null;
	private echarts: any | null = null;
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
			this.echarts = await import( 'echarts' );
		} catch {
			this.loadError.set( 'echarts is not installed. Add `npm install echarts` to your app.' );
			return;
		}

		this.zone.runOutsideAngular( () => {
			this.chart = this.echarts.init( this.chartHostRef().nativeElement );
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
