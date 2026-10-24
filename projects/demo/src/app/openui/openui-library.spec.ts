import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OpenUiRendererComponent, OpenUIError } from '@openuidev/angular-lang';
import { XiriBarChartComponent } from 'projects/xiri-ng/src/lib/barchart/barchart.component';
import { XiriRadarChartComponent } from 'projects/xiri-ng/src/lib/radarchart/radarchart.component';
import { XiriScatterChartComponent } from 'projects/xiri-ng/src/lib/scatterchart/scatterchart.component';
import { XiriTableComponent } from 'projects/xiri-ng/src/lib/table/table.component';
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

	it( 'lays bars on their side with horizontal = true', async () => {
		const { fixture } = await render( 'root = Card("R", [chart])\nchart = BarChart(["Wien", "Graz"], [3, 2], "Filialen", true)' );

		const chart = fixture.debugElement.query( By.directive( XiriBarChartComponent ) ).componentInstance as XiriBarChartComponent;
		expect( chart.settings() ).toMatchObject( { title: 'Filialen', horizontal: true } );
	} );

	it( 'renders RadarChart with Series children', async () => {
		const { fixture, errors } = await render( `root = Card("Vergleich", [radar])
radar = RadarChart(["Tempo", "Preis"], [a, b], "Produkte", 10)
a = Series("Modell A", [8, 3])
b = Series("Modell B", [5, 6])` );

		const chart = fixture.debugElement.query( By.directive( XiriRadarChartComponent ) ).componentInstance as XiriRadarChartComponent;
		expect( chart.settings() ).toEqual( {
			title: 'Produkte', area: true,
			indicators: [ { name: 'Tempo', max: 10 }, { name: 'Preis', max: 10 } ],
			series: [ { name: 'Modell A', values: [ 8, 3 ] }, { name: 'Modell B', values: [ 5, 6 ] } ],
		} );
		expect( errors.flat() ).toEqual( [] );
	} );

	it( 'renders ScatterChart with ScatterSeries of [x, y] points', async () => {
		const { fixture, errors } = await render( `root = Card("Filialen", [sc])
sc = ScatterChart([s], "Fläche und Umsatz", "Fläche", "Umsatz")
s = ScatterSeries("Innenstadt", [[120, 4.2], [80, 3.1]])` );

		const chart = fixture.debugElement.query( By.directive( XiriScatterChartComponent ) ).componentInstance as XiriScatterChartComponent;
		expect( chart.settings() ).toEqual( {
			title: 'Fläche und Umsatz', xLabel: 'Fläche', yLabel: 'Umsatz',
			series: [ { name: 'Innenstadt', points: [ { x: 120, y: 4.2 }, { x: 80, y: 3.1 } ] } ],
		} );
		expect( errors.flat() ).toEqual( [] );
	} );

	it( 'renders Markdown as sanitized HTML', async () => {
		const { el, fixture } = await render( 'root = Card("Text", [md])\nmd = Markdown("## Hallo\\n\\n- **eins**")' );
		await vi.waitFor( () => { // marked wird lazy geladen
			fixture.detectChanges();
			expect( el.querySelector( 'xiri-markdown h2' )?.textContent ).toBe( 'Hallo' );
		} );
		expect( el.querySelector( 'xiri-markdown li strong' )?.textContent ).toBe( 'eins' );
	} );

	it( 'renders a half-streamed program without the missing children', async () => {
		const { el } = await render( 'root = Card("Umsatz", [s1, chart])\ns1 = Stat("Bestellungen", 128, " St', true );

		expect( el.querySelector( 'xiri-section h2' )?.textContent ).toBe( 'Umsatz' );
		expect( el.querySelector( 'xiri-stat .suffix' )?.textContent ).toBe( ' St' );
		expect( el.querySelector( 'xiri-barchart' ) ).toBeNull();
	} );

	const tableRows = ( el: HTMLElement ) => el.querySelectorAll( 'xiri-table tr.mat-mdc-row' );

	it( 'Table rendert xiri-table mit Zahlspalte und Export-Buttons', async () => {
		const { fixture, el, errors } = await render( 'root = Card("T", [t])\nt = Table(["Obst", "Preis"], [["Apfel", 1.5], ["Birne", null]], "Preise")' );

		expect( tableRows( el ).length ).toBe( 2 );
		expect( el.querySelector( 'xiri-table .export-csv button' ) ).not.toBeNull();
		expect( el.querySelector( 'xiri-table .export-excel button' ) ).not.toBeNull();
		const table = fixture.debugElement.query( By.directive( XiriTableComponent ) ).componentInstance as XiriTableComponent;
		expect( table.settings().fields ).toMatchObject( [ { id: 'c0', name: 'Obst' }, { id: 'c1', name: 'Preis', format: 'number' } ] );
		expect( table.settings().data?.[ 0 ] ).toMatchObject( { c0: 'Apfel', c1: [ expect.any( String ), 1.5 ] } );
		expect( table.settings().options ).toMatchObject( { title: 'Preise', clientExport: true } );
		expect( errors.flat() ).toEqual( [] );
	} );

	it( 'Table füllt kurze Zeilen auf', async () => {
		const { fixture, errors } = await render( 'root = Card("T", [t])\nt = Table(["Obst", "Preis"], [["Apfel"]])' );

		const table = fixture.debugElement.query( By.directive( XiriTableComponent ) ).componentInstance as XiriTableComponent;
		expect( table.settings().data ).toEqual( [ { id: 0, c0: 'Apfel', c1: null } ] );
		expect( errors.flat() ).toEqual( [] );
	} );

	// xiri-table liest Spalten und Optionen nur beim Start; beim Streamen kommen Spalten nach.
	it( 'Table übernimmt nachkommende Spalten', async () => {
		const { fixture, el } = await render( 'root = Card("T", [t])\nt = Table(["Obst"], [["Apfel"]])', true );
		expect( el.querySelectorAll( 'xiri-table th.mat-mdc-header-cell' ).length ).toBe( 1 );

		fixture.componentRef.setInput( 'response', 'root = Card("T", [t])\nt = Table(["Obst", "Preis"], [["Apfel", 2], ["Birne", 3]])' );
		await fixture.whenStable();
		expect( el.querySelectorAll( 'xiri-table th.mat-mdc-header-cell' ).length ).toBe( 2 );
		expect( tableRows( el ).length ).toBe( 2 );
	} );

	it( 'generates a system prompt that lists the xiri signatures', () => {
		const prompt = xiriOpenUiLibrary.prompt();

		expect( prompt ).toContain( 'Card(' );
		expect( prompt ).toContain( 'Stat(' );
		expect( prompt ).toContain( 'BarChart(' );
		expect( prompt ).toContain( 'RadarChart(' );
		expect( prompt ).toContain( 'ScatterChart(' );
		expect( prompt ).toContain( 'Markdown(' );
		expect( prompt ).toContain( 'Table(' );
	} );
} );
