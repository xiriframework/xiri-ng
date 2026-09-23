import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SafehtmlPipe } from './safehtml.pipe';

describe( 'SafehtmlPipe', () => {
	const pipe = () => TestBed.runInInjectionContext( () => new SafehtmlPipe() );

	it( 'entfernt Event-Handler', () => {
		const out = pipe().transform( '<img src="x" onerror="alert(1)">' );
		expect( out ).not.toContain( 'onerror' );
	} );

	it( 'entfernt script-Elemente', () => {
		expect( pipe().transform( '<b>ok</b><script>alert(1)</script>' ) ).not.toContain( '<script' );
	} );

	it( 'behält Formatierung und class', () => {
		expect( pipe().transform( '<span class="badge">ok</span><br><b>x</b>' ) )
			.toBe( '<span class="badge">ok</span><br><b>x</b>' );
	} );

	it( 'neutralisiert javascript:-Links', () => {
		expect( pipe().transform( '<a href="javascript:alert(1)">x</a>' ) ).not.toContain( 'href="javascript:' );
	} );

	it( 'liefert leeren String für null/undefined', () => {
		expect( pipe().transform( null ) ).toBe( '' );
		expect( pipe().transform( undefined ) ).toBe( '' );
	} );

	it( 'entfernt style-Attribute (bewusste Verhaltensänderung)', () => {
		expect( pipe().transform( '<span style="color:red">x</span>' ) ).toBe( '<span>x</span>' );
	} );
} );
