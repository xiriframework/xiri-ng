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
} );
