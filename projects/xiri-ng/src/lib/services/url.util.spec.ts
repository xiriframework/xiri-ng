import { describe, it, expect } from 'vitest';
import { isSafeHref } from './url.util';

describe( 'isSafeHref', () => {
	it.each( [
		'https://example.com',
		'http://example.com/x',
		'/a/b?x=1',
		'Test/Page',
		'#anchor',
		'',
		'mailto:a@b.at',
		'tel:+43123',
	] )( 'erlaubt %s', url => {
		expect( isSafeHref( url ) ).toBe( true );
	} );

	it.each( [
		'javascript:alert(1)',
		' JaVaScRiPt:alert(1)',
		'java\tscript:alert(1)',
		'data:text/html,<script>alert(1)</script>',
		'vbscript:x',
		'http://[',
	] )( 'blockt %s', url => {
		expect( isSafeHref( url ) ).toBe( false );
	} );
} );
