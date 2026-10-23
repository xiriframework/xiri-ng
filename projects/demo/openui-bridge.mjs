// Brücke zwischen der OpenUI-Demo (/web/OpenUI) und `claude -p`: streamt die Antwort als Text an den Browser.
// Start: npm run openui-bridge (Port 4310, im Dev-Server unter /openui-bridge erreichbar, siehe proxy.conf.json).
// claude läuft mit dem Login dessen, der die Brücke startet, und die Demo ist öffentlich: jede Anfrage braucht
// den Schlüssel aus .openui-bridge-token (wird beim ersten Start erzeugt).
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { randomUUID, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const MAX_MESSAGE = 2000;
const TIMEOUT_MS = 180_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function createBridge( { claudeBin = 'claude', token, promptFile } ) {
	const expected = Buffer.from( token );
	// ponytail: eine Anfrage zur Zeit statt Warteschlange; reicht für eine Demo mit einem Nutzer.
	let busy = false;

	return http.createServer( async ( req, res ) => {
		const fail = ( status, text ) => res.writeHead( status, { 'Content-Type': 'text/plain; charset=utf-8' } ).end( text );

		const given = Buffer.from( String( req.headers[ 'x-bridge-token' ] ?? '' ) );
		if ( given.length !== expected.length || !timingSafeEqual( given, expected ) )
			return fail( 401, 'Schlüssel fehlt oder ist falsch' );
		if ( req.method !== 'POST' )
			return fail( 405, 'nur POST' );

		let body;
		try {
			let raw = '';
			req.setEncoding( 'utf8' );
			for await ( const chunk of req ) {
				raw += chunk;
				if ( raw.length > 10 * MAX_MESSAGE ) return fail( 413, 'zu groß' );
			}
			body = JSON.parse( raw );
		} catch {
			return fail( 400, 'kein JSON' );
		}
		const { message, sessionId } = body ?? {};
		if ( typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE )
			return fail( 400, `Nachricht fehlt oder ist länger als ${ MAX_MESSAGE } Zeichen` );
		if ( sessionId != null && !UUID.test( sessionId ) )
			return fail( 400, 'ungültige Session' );
		if ( busy )
			return fail( 429, 'Claude antwortet gerade noch' );

		busy = true;
		const id = sessionId ?? randomUUID();
		// Die Nachricht geht über stdin, nie ins argv: claude würde "--settings=…" sonst als Option lesen.
		// --tools "": das Modell kann auf dem Server nichts ausführen. --setting-sources "": keine Hooks/Plugins des
		// Nutzers. cwd = tmpdir: keine Projekt-CLAUDE.md im Kontext. (--bare scheitert mit OAuth-Login.)
		const child = spawn( claudeBin, [
			'-p',
			'--output-format', 'stream-json', '--include-partial-messages', '--verbose',
			'--tools', '', '--setting-sources', '',
			'--system-prompt-file', promptFile,
			...( sessionId ? [ '--resume', id ] : [ '--session-id', id ] ),
		], { cwd: tmpdir(), stdio: [ 'pipe', 'pipe', 'pipe' ] } );
		child.stdin.on( 'error', () => undefined ); // claude schon beendet: close meldet den Fehler
		child.stdin.end( message );

		let stderr = '';
		child.stderr.on( 'data', d => stderr = ( stderr + d ).slice( -2000 ) );
		const timer = setTimeout( () => child.kill(), TIMEOUT_MS );
		res.on( 'close', () => child.kill() );

		createInterface( { input: child.stdout } ).on( 'line', line => {
			let e;
			try { e = JSON.parse( line ); } catch { return; }
			const text = e.type === 'stream_event' && e.event?.delta?.type === 'text_delta' ? e.event.delta.text : '';
			if ( !text ) return;
			if ( !res.headersSent )
				res.writeHead( 200, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Session-Id': id, 'Cache-Control': 'no-cache' } );
			res.write( text );
		} );

		child.on( 'error', err => stderr += String( err ) );
		child.on( 'close', code => {
			clearTimeout( timer );
			busy = false;
			if ( res.headersSent && code === 0 ) return res.end();
			console.error( `claude abgebrochen (Code ${ code }): ${ stderr }` );
			// Halber Stream: abbrechen statt sauber beenden, sonst hält der Browser die Antwort für vollständig.
			if ( res.headersSent ) return res.destroy();
			fail( 502, 'Claude hat nicht geantwortet (Details im Log der Brücke)' );
		} );
	} );
}

if ( process.argv[ 1 ] === fileURLToPath( import.meta.url ) ) {
	const here = dirname( fileURLToPath( import.meta.url ) );
	const tokenFile = join( here, '../../.openui-bridge-token' );
	if ( !existsSync( tokenFile ) )
		writeFileSync( tokenFile, randomBytes( 18 ).toString( 'base64url' ) + '\n', { mode: 0o600 } );
	const token = readFileSync( tokenFile, 'utf8' ).trim();
	const port = Number( process.env.OPENUI_BRIDGE_PORT ?? 4310 );
	createBridge( { token, promptFile: join( here, 'src/app/openui/openui-prompt.txt' ) } )
		.listen( port, '127.0.0.1', () => console.log( `OpenUI-Brücke auf 127.0.0.1:${ port }, Schlüssel: ${ token }` ) );
}
