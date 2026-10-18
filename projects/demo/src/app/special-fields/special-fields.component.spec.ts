import { describe, it, expect, afterEach } from 'vitest';
import { ComponentFixture } from '@angular/core/testing';
import { renderDemo, waitFor } from '../../testing/demo-harness';
import { AppComponent } from '../app.component';

const ENTER = { key: 'Enter', keyCode: 13, cancelable: true }; // Material wertet keyCode aus

describe( 'Special fields demo page: chips', () => {
	let fixture: ComponentFixture<AppComponent>;

	afterEach( () => document.querySelectorAll( '.cdk-overlay-container' ).forEach( e => e.remove() ) );

	function chips( label: string ): HTMLElement {
		const all = Array.from( ( fixture.nativeElement as HTMLElement ).querySelectorAll<HTMLElement>( 'xiri-chips' ) );
		const found = all.find( c => c.querySelector( 'mat-label' )?.textContent?.trim() === label );
		if ( !found )
			throw new Error( `no chips field "${ label }"` );
		return found;
	}
	const chipRows = ( label: string ) => Array.from( chips( label ).querySelectorAll<HTMLElement>( 'mat-chip-row' ) );
	const chipTexts = ( label: string ) => chipRows( label ).map( c => c.textContent?.replace( 'cancel', '' ).trim() );
	const panelOptions = () => Array.from( document.querySelectorAll<HTMLElement>( '.mat-mdc-autocomplete-panel mat-option' ) );

	async function type( label: string, text: string ): Promise<HTMLInputElement> {
		const input = chips( label ).querySelector( 'input' ) as HTMLInputElement;
		input.focus();
		input.value = text;
		input.dispatchEvent( new Event( 'input' ) );
		fixture.detectChanges();
		await fixture.whenStable();
		return input;
	}

	it( 'zeigt die Kategorien als gefärbte Options-Chips', async () => {
		fixture = await renderDemo( '/SpecialFields' );
		const frontend = chipRows( 'Categories (from list)' ).find( c => c.textContent?.includes( 'Frontend' ) );
		expect( frontend?.classList ).toContain( 'chip-primary' );
	} );

	it( 'fügt einen nachgeladenen Vorschlag als Freitext-Chip ein', async () => {
		fixture = await renderDemo( '/SpecialFields' );
		await type( 'Tags (free text)', 'Fahrzeug 1' );
		await waitFor( fixture, () => panelOptions().some( o => o.textContent?.includes( 'Fahrzeug 10' ) ) );

		panelOptions().find( o => o.textContent?.includes( 'Fahrzeug 10' ) )!.click();
		fixture.detectChanges();

		expect( chipTexts( 'Tags (free text)' ) ).toContain( 'Fahrzeug 10' );
	} );

	it( 'nimmt bei String-Options ohne Freitext nur Optionen an', async () => {
		fixture = await renderDemo( '/SpecialFields' );
		const label = 'Interfaces (no free text)';

		const input = await type( label, 'bogus' );
		input.dispatchEvent( new KeyboardEvent( 'keydown', ENTER ) );
		fixture.detectChanges();
		expect( chipTexts( label ) ).not.toContain( 'bogus' );
		expect( input.value ).toBe( 'bogus' );

		await type( label, 'Ethernet 0' );
		input.dispatchEvent( new KeyboardEvent( 'keydown', ENTER ) );
		fixture.detectChanges();
		// Die Farbe kommt nur aus der Option: ein Freitext-Chip "Ethernet 0" wäre ungefärbt.
		const eth0 = chipRows( label ).find( c => c.textContent?.includes( 'Ethernet 0' ) );
		expect( eth0?.classList ).toContain( 'chip-primary' );
	} );
} );
