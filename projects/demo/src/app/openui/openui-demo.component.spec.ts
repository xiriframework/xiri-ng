import { describe, it, expect } from 'vitest';
import { renderDemo, waitFor } from '../../testing/demo-harness';

describe( 'OpenUI demo page', () => {

	it( 'rendert das Beispielprogramm mit xiri-Komponenten und zeigt den Systemprompt', async () => {
		const fixture = await renderDemo( '/OpenUI' );
		const el = fixture.nativeElement as HTMLElement;

		await waitFor( fixture, () => !!el.querySelector( 'openui-renderer xiri-barchart' ) );
		expect( el.querySelector( 'openui-renderer xiri-section h2' )?.textContent ).toBe( 'Support-Überblick' );
		expect( el.querySelectorAll( 'openui-renderer xiri-stat' ).length ).toBe( 3 );
		expect( el.querySelector( 'pre.prompt' )?.textContent ).toContain( 'BarChart(' );
	} );

	it( 'zeigt im Beispiel eine Tabelle mit CSV- und Excel-Export', async () => {
		const fixture = await renderDemo( '/OpenUI' );
		const el = fixture.nativeElement as HTMLElement;

		await waitFor( fixture, () => !!el.querySelector( 'openui-renderer xiri-table tr.mat-mdc-row' ) );
		expect( el.querySelectorAll( 'openui-renderer xiri-table tr.mat-mdc-row' ).length ).toBe( 4 );
		expect( el.querySelector( 'openui-renderer xiri-table button.export-csv' ) ).not.toBeNull();
		expect( el.querySelector( 'openui-renderer xiri-table button.export-excel' ) ).not.toBeNull();
	} );

	it( 'rendert Änderungen im Textfeld', async () => {
		const fixture = await renderDemo( '/OpenUI' );
		const el = fixture.nativeElement as HTMLElement;

		const textarea = el.querySelector( 'textarea.program' ) as HTMLTextAreaElement;
		textarea.value = 'root = Card("Neu", [s])\ns = Stat("Offen", 7)';
		textarea.dispatchEvent( new Event( 'input' ) );

		await waitFor( fixture, () => el.querySelector( 'openui-renderer xiri-section h2' )?.textContent === 'Neu' );
		expect( el.querySelectorAll( 'openui-renderer xiri-stat' ).length ).toBe( 1 );
	} );

	it( 'streamt das Programm zeichenweise und endet beim vollständigen Ergebnis', async () => {
		const fixture = await renderDemo( '/OpenUI' );
		const el = fixture.nativeElement as HTMLElement;
		const button = () => el.querySelector( 'button.stream' ) as HTMLButtonElement;

		button().click();
		await waitFor( fixture, () => button().disabled && el.querySelectorAll( 'openui-renderer xiri-stat' ).length < 3 );
		await waitFor( fixture, () => !button().disabled, 8000 );
		expect( el.querySelectorAll( 'openui-renderer xiri-stat' ).length ).toBe( 3 );
		expect( el.querySelector( 'openui-renderer xiri-barchart' ) ).not.toBeNull();
	}, 10000 );
} );
