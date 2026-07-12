import { describe, it, expect } from 'vitest';
import { XiriBulletChartComponent } from './bulletchart.component';
import { TestBed } from '@angular/core/testing';

describe( 'XiriBulletChartComponent', () => {
	it( 'baut horizontalen Balken mit Ziel-markLine', () => {
		TestBed.configureTestingModule( { imports: [ XiriBulletChartComponent ] } );
		const fixture = TestBed.createComponent( XiriBulletChartComponent );
		fixture.componentRef.setInput( 'settings', { value: 70, target: 90, max: 100 } );
		const opt = fixture.componentInstance.option();
		expect( opt.series[0].type ).toBe( 'bar' );
		expect( opt.xAxis.max ).toBe( 100 );
		expect( opt.series[0].markLine!.data[0].xAxis ).toBe( 90 );
	} );

	it( 'zeigt Value- und Target-Labels (sonst ist der Chart nicht lesbar)', () => {
		TestBed.configureTestingModule( { imports: [ XiriBulletChartComponent ] } );
		const fixture = TestBed.createComponent( XiriBulletChartComponent );
		fixture.componentRef.setInput( 'settings', { value: 82, target: 90, label: 'Q3' } );
		const bar = fixture.componentInstance.option().series[0];

		expect( bar.label?.show ).toBe( true );
		expect( String( bar.label?.formatter ) ).toContain( '82' );
		expect( bar.markLine!.label?.show ).toBe( true );
		expect( String( bar.markLine!.label?.formatter ) ).toContain( '90' );
	} );
} );
