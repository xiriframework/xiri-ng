import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OpenUiRendererComponent, OpenUIError } from '@openuidev/angular-lang';
import { XiriBarChartComponent } from 'projects/xiri-ng/src/lib/barchart/barchart.component';
import { xiriOpenUiLibrary } from './openui-library';

const program = `root = Card("Umsatz", [s1, chart], "Letzte 3 Monate", "payments")
s1 = Stat("Bestellungen", 128, " Stk", "shopping_cart")
chart = BarChart(["Jan", "Feb", "Mär"], [12, 15, 9], "Pro Monat")`;

async function render( response: string, isStreaming = false ) {
	TestBed.configureTestingModule( { imports: [ OpenUiRendererComponent ] } );
	const fixture = TestBed.createComponent( OpenUiRendererComponent );
	const errors: OpenUIError[][] = [];
	fixture.componentInstance.error.subscribe( e => errors.push( e ) );
	fixture.componentRef.setInput( 'library', xiriOpenUiLibrary );
	fixture.componentRef.setInput( 'isStreaming', isStreaming );
	fixture.componentRef.setInput( 'response', response );
	await fixture.whenStable();
	return { fixture, el: fixture.nativeElement as HTMLElement, errors };
}

describe( 'xiri OpenUI library', () => {

	it( 'renders Card as xiri-section with Stat and BarChart children in grid columns', async () => {
		const { fixture, el, errors } = await render( program );

		expect( el.querySelector( 'xiri-section h2' )?.textContent ).toBe( 'Umsatz' );
		expect( el.querySelector( 'xiri-section .section-subtitle' )?.textContent ).toBe( 'Letzte 3 Monate' );
		expect( el.querySelector( 'xiri-stat .stat-label' )?.textContent ).toBe( 'Bestellungen' );
		expect( el.querySelector( 'xiri-stat .stat-value' )?.textContent ).toContain( '128' );

		const cols = el.querySelectorAll( 'xiri-section .xrow > [class*="xcol"]' );
		expect( cols.length ).toBe( 2 );
		expect( cols[ 0 ].querySelector( 'xiri-stat' ) ).not.toBeNull();
		expect( cols[ 1 ].querySelector( 'xiri-barchart' ) ).not.toBeNull();

		const chart = fixture.debugElement.query( By.directive( XiriBarChartComponent ) ).componentInstance as XiriBarChartComponent;
		expect( chart.settings() ).toMatchObject( {
			title: 'Pro Monat',
			bars: [ { label: 'Jan', value: 12 }, { label: 'Feb', value: 15 }, { label: 'Mär', value: 9 } ],
		} );
		expect( errors.flat() ).toEqual( [] );
	} );

	it( 'draws only bars that have both label and value', async () => {
		const { fixture } = await render( 'root = Card("Umsatz", [chart])\nchart = BarChart(["Jan", "Feb", "Mär"], [12, 15])' );

		const chart = fixture.debugElement.query( By.directive( XiriBarChartComponent ) ).componentInstance as XiriBarChartComponent;
		expect( chart.settings().bars ).toEqual( [ { label: 'Jan', value: 12 }, { label: 'Feb', value: 15 } ] );
	} );

	it( 'renders a half-streamed program without the missing children', async () => {
		const { el } = await render( 'root = Card("Umsatz", [s1, chart])\ns1 = Stat("Bestellungen", 128, " St', true );

		expect( el.querySelector( 'xiri-section h2' )?.textContent ).toBe( 'Umsatz' );
		expect( el.querySelector( 'xiri-stat .suffix' )?.textContent ).toBe( ' St' );
		expect( el.querySelector( 'xiri-barchart' ) ).toBeNull();
	} );

	it( 'generates a system prompt that lists the xiri signatures', () => {
		const prompt = xiriOpenUiLibrary.prompt();

		expect( prompt ).toContain( 'Card(' );
		expect( prompt ).toContain( 'Stat(' );
		expect( prompt ).toContain( 'BarChart(' );
	} );
} );
