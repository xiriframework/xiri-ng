import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriScatterChartComponent } from './scatterchart.component';

describe( 'XiriScatterChartComponent', () => {
	function option( settings: object ) {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( { imports: [ XiriScatterChartComponent ] } );
		const f = TestBed.createComponent( XiriScatterChartComponent );
		f.componentRef.setInput( 'settings', settings );
		return f.componentInstance.option() as {
			xAxis: { type: string, name?: string }, yAxis: { type: string, name?: string },
			series: { type: string, name: string, data: { value: number[], name?: string }[] }[],
			tooltip: { formatter: ( p: object ) => string },
		};
	}

	it( 'zeichnet je Serie Punkte auf zwei Wertachsen mit Achsentiteln', () => {
		const opt = option( {
			series: [ { name: 'Filialen', points: [ { x: 1, y: 2, name: 'Wien' }, { x: 3, y: 4 } ] } ],
			xLabel: 'Fläche', yLabel: 'Umsatz',
		} );
		expect( opt.xAxis ).toMatchObject( { type: 'value', name: 'Fläche' } );
		expect( opt.yAxis ).toMatchObject( { type: 'value', name: 'Umsatz' } );
		expect( opt.series[ 0 ] ).toMatchObject( { type: 'scatter', name: 'Filialen' } );
		expect( opt.series[ 0 ].data ).toEqual( [ { value: [ 1, 2 ], name: 'Wien' }, { value: [ 3, 4 ], name: undefined } ] );
	} );

	it( 'Tooltip zeigt Punktname und Werte, HTML maskiert', () => {
		const opt = option( { series: [ { name: 'S', points: [ { x: 1, y: 2, name: '<b>' } ] } ] } );
		const html = opt.tooltip.formatter( { seriesName: 'S', name: '<b>', value: [ 1, 2 ], marker: '' } );
		expect( html ).toContain( '&lt;b&gt;' );
		expect( html ).toContain( '1' );
		expect( html ).toContain( '2' );
	} );
} );
