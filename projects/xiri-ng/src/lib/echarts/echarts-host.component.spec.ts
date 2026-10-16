import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriEchartsHostComponent, withThemeFont } from './echarts-host.component';

describe( 'XiriEchartsHostComponent', () => {

	it( 'does not start echarts when it is destroyed while echarts is still loading', async () => {
		TestBed.configureTestingModule( { imports: [ XiriEchartsHostComponent ] } );
		const fixture = TestBed.createComponent( XiriEchartsHostComponent );
		fixture.componentRef.setInput( 'option', {} );
		fixture.detectChanges();   // ngAfterViewInit starts import( 'echarts' )
		const host = fixture.componentInstance.chartHostRef().nativeElement;
		fixture.destroy();

		await import( 'echarts' );
		await new Promise( resolve => setTimeout( resolve ) );

		// echarts.init marks its element with this attribute
		expect( host.hasAttribute( '_echarts_instance_' ) ).toBe( false );
	} );

	// echarts draws in its own default font ('sans-serif'), not the app's.
	it( 'gives the chart option the app font without overriding an explicit textStyle', () => {
		expect( withThemeFont( { series: [] }, 'Roboto' ) ).toEqual( { series: [], textStyle: { fontFamily: 'Roboto' } } );
		expect( withThemeFont( { textStyle: { fontSize: 10 } }, 'Roboto' ) ).toEqual( { textStyle: { fontFamily: 'Roboto', fontSize: 10 } } );
		expect( withThemeFont( { textStyle: { fontFamily: 'Mono' } }, 'Roboto' ) ).toEqual( { textStyle: { fontFamily: 'Mono' } } );
	} );
} );
