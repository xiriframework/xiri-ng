import { HttpRequest } from '@angular/common/http';
import { XiriChatActivity, XiriChatMessage, XiriChatPage } from 'projects/xiri-ng/src/lib/chat/chat.types';

// In-memory-Gegenseite der Chat-Demo. ponytail: Modulzustand, lebt bis zum Neuladen der Seite.
interface Stored extends XiriChatMessage {
	changed: number;
}

const PAGE = 20;
const LINES = [ 'Hallo zusammen!', 'Hat jemand die Lieferung schon gesehen?', 'Ja, ist heute früh gekommen.', 'Super, danke!',
	'Ich schau mir das später an.', 'Passt, bis dann.' ];

// Markdown-Antworten von Anna: eine auf der ersten Seite, eine erst beim Nachladen (Index 30).
const MARKDOWN: Record<number, string> = {
	57: '**Lieferstatus** für heute:\n\n| Position | Menge | Lager | Status | Bemerkung |\n|---|---:|---|---|---|\n'
		+ '| Schrauben M6 | 500 | Halle 2, Regal 14 | ✅ geliefert | vollständig, Lieferschein liegt bei<br>Rechnung folgt |\n'
		+ '| Dübel 8 mm | 200 | Halle 2, Regal 15 | ⏳ unterwegs | Spedition meldet Verspätung bis morgen Mittag |\n\n'
		+ '- Rest kommt morgen\n- Abholung ab `08:00`',
	30: 'Kurze Zusammenfassung:\n\n1. Bestellung ist **raus**\n2. Bestätigung per Mail\n\n```\nBestellnr. 2026-1042\n```',
};

let seq = 0;
let nextId = 0;
const store: Stored[] = seed();
// Steht zwischen „gelesen“ und Annas Antwort; jede Seite bringt den aktuellen Stand mit.
let activity: XiriChatActivity | null = null;

function seed(): Stored[] {
	const now = Math.floor( Date.now() / 1000 );
	return Array.from( { length: 60 }, ( _, i ) => {
		const who = i % 3;
		return {
			id: 'm-' + ( ++nextId ),
			text: MARKDOWN[ i ] ?? LINES[ i % LINES.length ],
			...( MARKDOWN[ i ] ? { format: 'markdown' as const } : {} ),
			time: now - ( 60 - i ) * 3600,
			changed: ++seq,
			...( who === 2 ? { own: true, status: 'read' as const } : { from: who === 0 ? 'Anna Berger' : 'Ben Huber' } ),
		};
	} );
}

function strip( { changed, ...msg }: Stored ): XiriChatMessage {
	return msg;
}

function page( messages: Stored[], hasOlder: boolean ): XiriChatPage {
	return { messages: messages.map( strip ), cursor: String( seq ), hasOlder, activity };
}

function touch( msg: Stored, patch: Partial<XiriChatMessage> ): void {
	Object.assign( msg, patch, { changed: ++seq } );
}

// GET Demo/Chat (Startseite), ?cursor= (Änderungen), ?before=<id> (ältere); POST sendet.
export function chatMockResponse( req: HttpRequest<unknown> ): unknown {
	const params = new URL( req.url, 'http://mock' ).searchParams;
	if ( req.method === 'POST' ) {
		const { text, clientId } = req.body as { text: string; clientId: string };
		const msg: Stored = {
			id: 'm-' + ( ++nextId ), text, clientId, time: Math.floor( Date.now() / 1000 ), own: true, status: 'sent', changed: ++seq,
		};
		store.push( msg );
		setTimeout( () => touch( msg, { status: 'delivered' } ), 800 );
		let typing: XiriChatActivity | undefined;
		setTimeout( () => {
			touch( msg, { status: 'read' } );
			activity = typing = { text: 'Anna schreibt …', since: Math.floor( Date.now() / 1000 ) };
		}, 1600 );
		// Länger als ein Poll-Intervall (2 s), sonst sieht man „Anna schreibt …“ kaum.
		setTimeout( () => {
			if ( activity === typing ) // eine spätere Nachricht hat schon ihre eigene Aktivität
				activity = null;
			store.push( { id: 'm-' + ( ++nextId ), text: 'Danke, ist angekommen: „' + text + '“', time: Math.floor( Date.now() / 1000 ),
				from: 'Anna Berger', changed: ++seq } );
		}, 4500 );
		return { message: strip( msg ) };
	}
	const before = params.get( 'before' );
	if ( before !== null ) {
		const idx = Math.max( 0, store.findIndex( m => m.id === before ) );
		const from = Math.max( 0, idx - PAGE );
		return page( store.slice( from, idx ), from > 0 );
	}
	const cursor = params.get( 'cursor' );
	if ( cursor )
		return page( store.filter( m => m.changed > Number( cursor ) ), false );
	return page( store.slice( -PAGE ), store.length > PAGE );
}
