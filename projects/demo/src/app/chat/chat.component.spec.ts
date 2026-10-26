import { describe, it } from 'vitest';
import { mainText, renderDemo, waitFor } from '../../testing/demo-harness';

describe( 'Chat demo page', () => {
	it( 'zeigt den Verlauf, sendet und bekommt eine Antwort', async () => {
		const fixture = await renderDemo( '/Chat' );
		await waitFor( fixture, () => mainText( fixture ).includes( 'Passt, bis dann.' ) );

		const textarea = fixture.nativeElement.querySelector( 'xiri-chat textarea' ) as HTMLTextAreaElement;
		textarea.value = 'Grüß dich';
		textarea.dispatchEvent( new Event( 'input' ) );
		textarea.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter', cancelable: true } ) );

		await waitFor( fixture, () => mainText( fixture ).includes( 'Grüß dich' ) );
		const activity = () => fixture.nativeElement.querySelector( 'xiri-chat .activity-text' )?.textContent ?? '';
		await waitFor( fixture, () => activity().includes( 'Anna schreibt' ), 5000 );
		await waitFor( fixture, () => mainText( fixture ).includes( 'Danke, ist angekommen: „Grüß dich“' ), 8000 );
		await waitFor( fixture, () => activity() === '' );
		// Der Seed enthält schon gelesene eigene Nachrichten, deshalb gezielt die neue prüfen.
		const ownRow = () => [ ...fixture.nativeElement.querySelectorAll( 'xiri-chat .row.own' ) as NodeListOf<HTMLElement> ]
			.find( r => r.textContent?.includes( 'Grüß dich' ) );
		await waitFor( fixture, () => !!ownRow()?.querySelector( '[aria-label="Gelesen"]' ) );
	}, 20000 );
} );
