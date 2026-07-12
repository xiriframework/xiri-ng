import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriHeatmapComponent } from './heatmap.component';

describe( 'XiriHeatmapComponent', () => {
	function make( settings: object ): XiriHeatmapComponent {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( { imports: [ XiriHeatmapComponent ] } );
		const f = TestBed.createComponent( XiriHeatmapComponent );
		f.componentRef.setInput( 'settings', settings );
		return f.componentInstance;
	}

	it( 'setzt axisLabel + visualMap vertikal (x-Labels sichtbar, kein Overlap)', () => {
		const opt = make( { xLabels: [ 'a' ], yLabels: [ 'x' ], cells: [] } )
			.option() as { xAxis: { axisLabel?: unknown }, visualMap: { orient: string } };
		expect( opt.xAxis.axisLabel ).toBeDefined();
		expect( opt.visualMap.orient ).toBe( 'vertical' );
	} );

	it( 'erhöht die Höhe bei rotierten x-Labels', () => {
		const rows = [ 'a', 'b', 'c', 'd', 'e' ];
		expect( make( { xLabels: [], yLabels: rows, cells: [] } ).height() ).toBe( '236px' );
		expect( make( { xLabels: [], yLabels: rows, cells: [], xLabelRotate: 45 } ).height() ).toBe( '286px' );
	} );
} );
