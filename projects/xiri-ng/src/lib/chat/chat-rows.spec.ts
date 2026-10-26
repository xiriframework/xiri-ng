import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriLocaleService } from '../services/locale.service';
import { buildChatRows, chatInitials, formatElapsed, XiriChatMsgRow } from './chat-rows';
import { XiriChatMessage } from './chat.types';

// 16.10.2026 12:00 Wien (10:00 UTC)
const NOW = Date.UTC( 2026, 9, 16, 10, 0 ) / 1000;
const at = ( d: number, h: number ) => Date.UTC( 2026, 9, d, h, 0 ) / 1000;

describe( 'buildChatRows', () => {
	let locale: XiriLocaleService;

	beforeEach( () => {
		locale = TestBed.inject( XiriLocaleService );
		locale.setLanguage( 'de' );
		locale.setTimezone( 'Europe/Vienna' );
	} );

	it( 'sortiert nach Zeit und setzt Heute/Gestern/Datum als Trenner', () => {
		const msgs: XiriChatMessage[] = [
			{ id: 'c', text: 'heute', time: at( 16, 8 ) },
			{ id: 'a', text: 'alt', time: at( 10, 8 ) },
			{ id: 'b', text: 'gestern', time: at( 15, 8 ) },
		];
		const rows = buildChatRows( msgs, NOW, locale, locale.chatLabels() );
		expect( rows.map( r => r.kind === 'day' ? r.label : r.msg.id ) )
			.toEqual( [ '10. Oktober 2026', 'a', 'Gestern', 'b', 'Heute', 'c' ] );
		expect( ( rows[ 5 ] as XiriChatMsgRow ).time ).toBe( '10:00' );
		// Nicht von heute: Datum vor der Uhrzeit, im Kurzformat der Locale.
		expect( ( rows[ 1 ] as XiriChatMsgRow ).time ).toBe( '10.10.2026 10:00' );
		expect( ( rows[ 3 ] as XiriChatMsgRow ).time ).toBe( '15.10.2026 10:00' );
		locale.setLanguage( 'en' );
		const en = buildChatRows( msgs, NOW, locale, locale.chatLabels() );
		expect( ( en[ 1 ] as XiriChatMsgRow ).time ).toBe( '10/10/2026 10:00' );
	} );

	it( 'gleiche Zeit behält die Eingangsreihenfolge', () => {
		const rows = buildChatRows( [ { id: 'x', text: '', time: NOW }, { id: 'y', text: '', time: NOW } ], NOW, locale, locale.chatLabels() );
		expect( rows.filter( r => r.kind === 'msg' ).map( r => ( r as XiriChatMsgRow ).msg.id ) ).toEqual( [ 'x', 'y' ] );
	} );

	it( 'zeigt den Absender nur bei der ersten Nachricht einer Folge', () => {
		const rows = buildChatRows( [
			{ id: '1', text: '', time: NOW, from: 'Anna' },
			{ id: '2', text: '', time: NOW + 1, from: 'Anna' },
			{ id: '3', text: '', time: NOW + 2, own: true, from: 'Anna' },
			{ id: '4', text: '', time: NOW + 3, from: 'Anna' },
			{ id: '5', text: '', time: NOW + 4, from: 'Ben' },
		], NOW, locale, locale.chatLabels() ).filter( r => r.kind === 'msg' ) as XiriChatMsgRow[];
		expect( rows.map( r => r.showFrom ) ).toEqual( [ true, false, false, true, true ] );
	} );

	it( 'Initialen aus maximal zwei Wörtern', () => {
		expect( chatInitials( 'anna maria berger' ) ).toBe( 'AM' );
		expect( chatInitials( '  Ben ' ) ).toBe( 'B' );
		expect( chatInitials( undefined ) ).toBe( '' );
	} );
} );

describe( 'XiriLocaleService.chatLabels', () => {
	it( 'liefert Deutsch, Englisch und fällt für fehlende Keys auf Deutsch zurück', () => {
		const locale = TestBed.inject( XiriLocaleService );
		locale.setLanguage( 'de' );
		expect( locale.chatLabels().send ).toBe( 'Senden' );
		locale.setLanguage( 'en' );
		expect( locale.chatLabels().send ).toBe( 'Send' );
		locale.registerLanguage( 'fr', {
			localeString: 'fr-FR', validationMessages: locale.validationMessagesFor(), chatLabels: { send: 'Envoyer' },
		} );
		locale.setLanguage( 'fr' );
		expect( locale.chatLabels().send ).toBe( 'Envoyer' );
		expect( locale.chatLabels().today ).toBe( 'Heute' );
	} );
} );

describe( 'formatElapsed', () => {
	it( 'm:ss, ab einer Stunde h:mm:ss, negativ als 0:00', () => {
		expect( formatElapsed( 42 ) ).toBe( '0:42' );
		expect( formatElapsed( 605 ) ).toBe( '10:05' );
		expect( formatElapsed( 3600 ) ).toBe( '1:00:00' );
		expect( formatElapsed( 3725 ) ).toBe( '1:02:05' );
		expect( formatElapsed( -5 ) ).toBe( '0:00' );
	} );
} );
