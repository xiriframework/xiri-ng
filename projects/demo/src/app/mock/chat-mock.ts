import { HttpRequest } from '@angular/common/http';
import { XiriChatMessage, XiriChatPage } from 'projects/xiri-ng/src/lib/chat/chat.types';

// In-memory-Gegenseite der Chat-Demo. ponytail: Modulzustand, lebt bis zum Neuladen der Seite.
interface Stored extends XiriChatMessage {
	changed: number;
}

const PAGE = 20;
const LINES = [ 'Hallo zusammen!', 'Hat jemand die Lieferung schon gesehen?', 'Ja, ist heute früh gekommen.', 'Super, danke!',
	'Ich schau mir das später an.', 'Passt, bis dann.' ];

let seq = 0;
let nextId = 0;
const store: Stored[] = seed();

function seed(): Stored[] {
	const now = Math.floor( Date.now() / 1000 );
	return Array.from( { length: 60 }, ( _, i ) => {
		const who = i % 3;
		return {
			id: 'm-' + ( ++nextId ),
			text: LINES[ i % LINES.length ],
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
	return { messages: messages.map( strip ), cursor: String( seq ), hasOlder };
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
		setTimeout( () => {
			touch( msg, { status: 'read' } );
			store.push( { id: 'm-' + ( ++nextId ), text: 'Danke, ist angekommen: „' + text + '“', time: Math.floor( Date.now() / 1000 ),
				from: 'Anna Berger', changed: ++seq } );
		}, 1600 );
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
