import { describe, it, expect } from 'vitest';
import { cellDefault, isEmptyRow, uniqueKey } from './rows.util';
import { XiriFormField } from '../field.interface';

const subs: XiriFormField[] = [
	{ id: 'key', type: 'text', hide: true },
	{ id: 'label', type: 'text' },
	{ id: 'qty', type: 'number' },
	{ id: 'required', type: 'bool', value: true },
	{ id: 'photo', type: 'bool' },
];

describe( 'rows.util', () => {
	it( 'cellDefault: value, sonst wie form-fields', () => {
		expect( subs.map( cellDefault ) ).toEqual( [ '', '', null, true, false ] );
		expect( cellDefault( { id: 's', type: 'select', multiple: true } ) ).toEqual( [] );
	} );

	it( 'isEmptyRow: Defaults und Leerzeichen zählen als leer', () => {
		expect( isEmptyRow( subs, { key: '', label: '   ', qty: null, required: true, photo: false } ) ).toBe( true );
		expect( isEmptyRow( subs, {} ) ).toBe( true );
	} );

	it( 'isEmptyRow: ein Wert abseits des Defaults oder ein versteckter Wert macht die Zeile nicht-leer', () => {
		expect( isEmptyRow( subs, { label: 'x' } ) ).toBe( false );
		expect( isEmptyRow( subs, { required: false } ) ).toBe( false );
		expect( isEmptyRow( subs, { qty: 0 } ) ).toBe( false );
		expect( isEmptyRow( subs, { key: 'brakes' } ) ).toBe( false );
	} );

	it( 'uniqueKey: getrimmt, ohne Groß-/Kleinschreibung, null wenn alles leer', () => {
		expect( uniqueKey( [ 'label' ], { label: ' Bremsen ' } ) ).toBe( uniqueKey( [ 'label' ], { label: 'bremsen' } ) );
		expect( uniqueKey( [ 'key' ], { key: '' } ) ).toBeNull();
		expect( uniqueKey( [ 'a', 'b' ], { a: 'x', b: '' } ) ).not.toBe( uniqueKey( [ 'a', 'b' ], { a: '', b: 'x' } ) );
	} );
} );
