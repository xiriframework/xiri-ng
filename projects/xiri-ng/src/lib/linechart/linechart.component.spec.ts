import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriLineChartComponent } from './linechart.component';

describe( 'XiriLineChartComponent', () => {
	function make( settings: object ): XiriLineChartComponent {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( { imports: [ XiriLineChartComponent ] } );
		const f = TestBed.createComponent( XiriLineChartComponent );
		f.componentRef.setInput( 'settings', settings );
		return f.componentInstance;
	}

	it( 'setzt axisLabel immer (nie undefined) — sonst rendert echarts keine x-Labels', () => {
		const opt = make( { xLabels: [ 'A', 'B' ], lines: [ { name: 'L', values: [ 1, 2 ] } ] } )
			.option() as { xAxis: { axisLabel?: unknown } };
		expect( opt.xAxis.axisLabel ).toBeDefined();
	} );

	it( 'vergrößert die Chart-Höhe bei rotierten x-Labels', () => {
		const base = { xLabels: [ 'A' ], lines: [ { name: 'L', values: [ 1 ] } ] };
		expect( make( { ...base, xLabelRotate: 90 } ).chartHeight() ).toBe( '280px' );
		expect( make( base ).chartHeight() ).toBe( '200px' );
	} );
} );
