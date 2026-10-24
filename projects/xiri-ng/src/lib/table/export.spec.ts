import { describe, it, expect } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { XiriTableField } from '../raw-table/tabefield.interface';
import { XiriTableRow } from './tree.service';
import { exportSheet, toCsv, toXlsx } from './export';

const fields: XiriTableField[] = [ { id: 'n', name: 'Name' }, { id: 'p', name: 'Preis', format: 'number' }, { id: 'b', name: 'Aktion', format: 'buttons' } ];
const rows: XiriTableRow[] = [
	{ n: 'Äpfel; rot', p: [ '1.234,5', 1234.5 ], b: [] },
	{ n: '=HYPERLINK("x")', p: [ '-2', -2 ], b: [] },
	{ n: null, p: null, b: [] },
];

describe( 'table export', () => {
	it( 'exportSheet: Kopf, Rohzahl, ohne Button-Spalte', () =>
		expect( exportSheet( fields, rows ) ).toEqual( [ [ 'Name', 'Preis' ], [ 'Äpfel; rot', 1234.5 ], [ '=HYPERLINK("x")', -2 ], [ null, null ] ] ) );

	it( 'exportSheet: Chips als Label, mehrere Werte mit Komma', () =>
		expect( exportSheet( [ { id: 'c', name: 'Tags', format: 'chips' }, { id: 't', name: 'Zeilen', format: 'text2' } ],
			[ { c: [ { label: 'rot' }, { label: 'neu' } ], t: [ 'a', 'b' ] } ] ) ).toEqual( [ [ 'Tags', 'Zeilen' ], [ 'rot, neu', 'a, b' ] ] ) );

	it( 'toCsv: BOM, Semikolon, Quoting, Formelschutz, Dezimalkomma', () =>
		expect( toCsv( exportSheet( fields, rows ), true ) ).toBe( '\uFEFF"Name";"Preis"\n"Äpfel; rot";1234,5\n"\'=HYPERLINK(""x"")";-2\n;\n' ) );

	// Liest ein Programm "," als Trenner, darf aus einem Text keine ungeschützte Formel-Zelle werden.
	it( 'toCsv: Text immer gequotet, auch mit Komma oder Tab', () =>
		expect( toCsv( [ [ 'a,=1+1', 'b\t=2' ] ], false ) ).toBe( '\uFEFF"a,=1+1";"b\t=2"\n' ) );

	it( 'toCsv: Punkt ohne Komma-Locale, Zeilenumbruch gequotet', () =>
		expect( toCsv( [ [ 'a\nb', 1.5 ] ], false ) ).toBe( '\uFEFF"a\nb";1.5\n' ) );

	it( 'toXlsx: Zahl als Zahl, Text geschützt', async () => {
		const files = unzipSync( new Uint8Array( await ( await toXlsx( [ [ 'Preis' ], [ 3.5 ], [ '-x' ] ] ) ).arrayBuffer() ) );
		const xml = Object.entries( files ).filter( ( [ name ] ) => name.endsWith( '.xml' ) ).map( ( [ , data ] ) => strFromU8( data ) ).join();
		expect( xml ).toContain( '<v>3.5</v>' );
		expect( xml ).toContain( '\'-x' );
	} );
} );
