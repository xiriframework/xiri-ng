// node --test projects/demo/openui-bridge.test.mjs — läuft auch in `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBridge } from './openui-bridge.mjs';

// Fake-claude: liest die Nachricht von stdin und streamt Argumente + Nachricht als zwei text_delta-Stücke zurück. "FAIL" endet mit Fehler, "SLOW" wartet.
const dir = mkdtempSync( join( tmpdir(), 'openui-bridge-' ) );
const fake = join( dir, 'claude' );
writeFileSync( fake, `#!/usr/bin/env node
const args = process.argv.slice( 2 );
let msg = '';
process.stdin.on( 'data', d => msg += d );
process.stdin.on( 'end', () => {
	if ( msg === 'FAIL' ) { process.stderr.write( 'kaputt' ); process.exit( 1 ); }
	const delta = text => console.log( JSON.stringify( { type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'text_delta', text } } } ) );
	console.log( JSON.stringify( { type: 'system', subtype: 'init' } ) );
	const text = JSON.stringify( { args, msg, cwd: process.cwd() } );
	setTimeout( () => {
		delta( text.slice( 0, 10 ) );
		delta( text.slice( 10 ) );
		console.log( JSON.stringify( { type: 'result', subtype: 'success' } ) );
	}, msg === 'SLOW' ? 500 : 0 );
} );
` );
chmodSync( fake, 0o755 );
const promptFile = join( dir, 'prompt.txt' );
writeFileSync( promptFile, 'PROMPT' );

async function withBridge( run ) {
	const server = createBridge( { claudeBin: fake, token: 'geheim', promptFile } );
	await new Promise( r => server.listen( 0, '127.0.0.1', r ) );
	const url = `http://127.0.0.1:${ server.address().port }/openui-bridge`;
	try { await run( url ); } finally { server.close(); }
}

const post = ( url, body, token = 'geheim' ) => fetch( url, {
	method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Bridge-Token': token }, body: JSON.stringify( body ),
} );

test( 'ohne gültigen Schlüssel 401', () => withBridge( async url => {
	assert.equal( ( await post( url, { message: 'hi' }, 'falsch' ) ).status, 401 );
	assert.equal( ( await post( url, { message: 'hi' }, '' ) ).status, 401 );
} ) );

test( 'streamt nur den Text, startet ohne Werkzeuge und Nutzer-Settings, neue Session mit --session-id', () => withBridge( async url => {
	const res = await post( url, { message: 'Zeig KPIs' } );
	assert.equal( res.status, 200 );
	const session = res.headers.get( 'x-session-id' );
	assert.match( session, /^[0-9a-f-]{36}$/ );

	const { args, msg, cwd } = JSON.parse( await res.text() );
	const arg = name => args[ args.indexOf( name ) + 1 ];
	assert.equal( msg, 'Zeig KPIs' );
	assert.ok( args.includes( '-p' ) );
	assert.equal( arg( '--tools' ), '' );
	assert.equal( arg( '--setting-sources' ), '' );
	assert.equal( arg( '--system-prompt-file' ), promptFile );
	assert.equal( arg( '--output-format' ), 'stream-json' );
	assert.ok( args.includes( '--include-partial-messages' ) );
	assert.equal( arg( '--session-id' ), session );
	assert.ok( !args.includes( '--resume' ) );
	assert.equal( cwd, tmpdir() );
} ) );

test( 'Folgefrage setzt die Session mit --resume fort', () => withBridge( async url => {
	const id = '3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f';
	const res = await post( url, { message: 'weiter', sessionId: id } );
	const { args } = JSON.parse( await res.text() );
	assert.equal( res.headers.get( 'x-session-id' ), id );
	assert.equal( args[ args.indexOf( '--resume' ) + 1 ], id );
	assert.ok( !args.includes( '--session-id' ) );
} ) );

// Eine Nachricht im argv würde claude als Option lesen (z. B. --settings mit Hooks → Befehle auf dem Server).
test( 'Nachricht geht über stdin, nie als Argument', () => withBridge( async url => {
	const evil = '--settings={"hooks":{}}';
	const { args, msg } = JSON.parse( await ( await post( url, { message: evil } ) ).text() );
	assert.equal( msg, evil );
	assert.ok( !args.some( a => a.includes( 'settings={' ) ), args.join( ' ' ) );
} ) );

test( 'ungültige Eingaben 400', () => withBridge( async url => {
	assert.equal( ( await post( url, { message: '' } ) ).status, 400 );
	assert.equal( ( await post( url, { message: 'x'.repeat( 2001 ) } ) ).status, 400 );
	assert.equal( ( await post( url, { message: 'hi', sessionId: '--help' } ) ).status, 400 );
} ) );

test( 'nur eine Anfrage gleichzeitig', () => withBridge( async url => {
	const slow = post( url, { message: 'SLOW' } );
	await new Promise( r => setTimeout( r, 100 ) );
	assert.equal( ( await post( url, { message: 'hi' } ) ).status, 429 );
	const first = await slow;
	assert.equal( first.status, 200 );
	await first.text();
	assert.equal( ( await post( url, { message: 'hi' } ) ).status, 200 );
} ) );

test( 'Fehler von claude ohne Text wird 502, stderr bleibt im Server-Log', () => withBridge( async url => {
	const res = await post( url, { message: 'FAIL' } );
	assert.equal( res.status, 502 );
	assert.doesNotMatch( await res.text(), /kaputt/ );
} ) );
