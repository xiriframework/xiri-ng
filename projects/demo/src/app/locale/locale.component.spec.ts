import { describe, it, expect } from 'vitest';
import { ComponentFixture } from '@angular/core/testing';
import { mainText, renderDemo, waitFor } from '../../testing/demo-harness';
import { AppComponent } from '../app.component';

function click( fixture: ComponentFixture<AppComponent>, group: string, label: string ): void {
	const buttons = fixture.nativeElement.querySelectorAll( `.${ group } button` ) as NodeListOf<HTMLButtonElement>;
	const button = [ ...buttons ].find( b => b.textContent?.trim() === label );
	if ( !button )
		throw new Error( `Button '${ label }' in .${ group } nicht gefunden` );
	button.click();
}

describe( 'Locale demo page', () => {
	it( 'trennt Textsprache und Format-Locale', async () => {
		const fixture = await renderDemo( '/Locale' );
		await waitFor( fixture, () => mainText( fixture ).includes( 'Pflichtfeld – bitte ausfüllen' ) );
		expect( mainText( fixture ) ).toContain( '1.234.567,89' );

		click( fixture, 'locale-buttons', 'English' );
		await waitFor( fixture, () => mainText( fixture ).includes( 'Required field' ) );
		expect( mainText( fixture ) ).toContain( '1,234,567.89' );

		click( fixture, 'locale-format-buttons', 'Deutsch' );
		await waitFor( fixture, () => mainText( fixture ).includes( '1.234.567,89' ) );
		expect( mainText( fixture ) ).toContain( 'Required field' );
		expect( mainText( fixture ) ).not.toContain( 'Pflichtfeld' );

		click( fixture, 'locale-format-buttons', 'wie Sprache' );
		await waitFor( fixture, () => mainText( fixture ).includes( '1,234,567.89' ) );
	} );
} );
