import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { XiriBarChartComponent } from './barchart.component';

describe( 'XiriBarChartComponent', () => {
	function make( settings: object, mode = 'simple' ): XiriBarChartComponent {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( { imports: [ XiriBarChartComponent ], providers: [ provideRouter( [] ) ] } );
		const f = TestBed.createComponent( XiriBarChartComponent );
		f.componentRef.setInput( 'mode', mode );
		f.componentRef.setInput( 'settings', settings );
		return f.componentInstance;
	}

	it( 'setzt axisLabel immer (nie undefined) — sonst rendert echarts keine x-Labels', () => {
		const opt = make( { bars: [ { label: 'A', value: 1 } ] } ).option() as { xAxis: { axisLabel?: unknown } };
		expect( opt.xAxis.axisLabel ).toBeDefined();
	} );

	it( 'vergrößert die Chart-Höhe bei rotierten x-Labels', () => {
		expect( make( { bars: [], xLabelRotate: 90 } ).chartHeight() ).toBe( '280px' );
		expect( make( { bars: [], xLabelRotate: 45 } ).chartHeight() ).toBe( '250px' );
		expect( make( { bars: [] } ).chartHeight() ).toBe( '200px' );
	} );

	it( 'lässt oben mehr Platz für Wert-Labels über den Balken', () => {
		const opt = make( { bars: [ { label: 'A', value: 1 } ], showValues: true } ).option() as { grid: { top: number } };
		expect( opt.grid.top ).toBeGreaterThan( 24 );
	} );
} );
