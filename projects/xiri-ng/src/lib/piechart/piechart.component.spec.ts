import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { XiriPieChartComponent } from './piechart.component';

describe( 'XiriPieChartComponent warn', () => {
	let fixture: ComponentFixture<XiriPieChartComponent>;
	let component: XiriPieChartComponent;
	beforeEach( () => {
		TestBed.configureTestingModule( { imports: [ XiriPieChartComponent ] } );
		fixture = TestBed.createComponent( XiriPieChartComponent );
		component = fixture.componentInstance;
	} );

	it( 'warnt ab 5 Segmenten', () => {
		fixture.componentRef.setInput( 'settings', { slices: [1, 2, 3, 4, 5].map( n => ( { name: '' + n, value: n } ) ) } );
		expect( component.warn() ).toBe( true );
	} );
	it( 'warnt nicht bei 4 Segmenten', () => {
		fixture.componentRef.setInput( 'settings', { slices: [1, 2, 3, 4].map( n => ( { name: '' + n, value: n } ) ) } );
		expect( component.warn() ).toBe( false );
	} );
} );
