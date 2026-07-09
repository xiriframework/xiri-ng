import { describe, it, expect } from 'vitest';
import { XiriUrlPipe } from './url.pipe';

describe( 'XiriUrlPipe', () => {
	const pipe = new XiriUrlPipe();

	it( 'parst Query-Params aus dem String', () => {
		const tree = pipe.transform( '/Admin/Devices/Table?config=98&x=1' );
		expect( tree?.queryParams ).toEqual( { config: '98', x: '1' } );
		expect( tree?.toString() ).toBe( '/Admin/Devices/Table?config=98&x=1' );
	} );

	it( 'URL ohne Query liefert leere Query-Params', () => {
		expect( pipe.transform( '/a/b' )?.queryParams ).toEqual( {} );
	} );

	it( 'leerer/undefined Input liefert null', () => {
		expect( pipe.transform( '' ) ).toBeNull();
		expect( pipe.transform( undefined ) ).toBeNull();
	} );
} );
