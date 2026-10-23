import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriRadarChartComponent } from './radarchart.component';

describe( 'XiriRadarChartComponent', () => {
	function option( settings: object ) {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( { imports: [ XiriRadarChartComponent ] } );
		const f = TestBed.createComponent( XiriRadarChartComponent );
		f.componentRef.setInput( 'settings', settings );
		return f.componentInstance.option() as {
			radar: { indicator: { name: string, max?: number }[] },
			series: { type: string, data: { name: string, value: number[], areaStyle?: unknown }[] }[],
			legend?: unknown,
		};
	}

	it( 'baut Achsen aus den Indikatoren und eine Fläche je Serie', () => {
		const opt = option( {
			indicators: [ { name: 'Tempo', max: 10 }, { name: 'Preis' } ],
			series: [ { name: 'A', values: [ 8, 3 ] }, { name: 'B', values: [ 5, 6 ] } ],
			area: true,
		} );
		expect( opt.radar.indicator ).toEqual( [ { name: 'Tempo', max: 10 }, { name: 'Preis', max: undefined } ] );
		expect( opt.series[ 0 ].type ).toBe( 'radar' );
		expect( opt.series[ 0 ].data.map( d => [ d.name, d.value ] ) ).toEqual( [ [ 'A', [ 8, 3 ] ], [ 'B', [ 5, 6 ] ] ] );
		expect( opt.series[ 0 ].data[ 0 ].areaStyle ).toBeDefined();
		expect( opt.legend ).toBeDefined();
	} );

	it( 'ohne area keine Füllung, mit einer Serie keine Legende', () => {
		const opt = option( { indicators: [ { name: 'X' } ], series: [ { name: 'A', values: [ 1 ] } ] } );
		expect( opt.series[ 0 ].data[ 0 ].areaStyle ).toBeUndefined();
		expect( opt.legend ).toBeUndefined();
	} );
} );
