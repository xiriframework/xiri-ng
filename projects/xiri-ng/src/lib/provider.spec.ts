import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { provideXiriServices } from './provider';

@Component( {
	template: `<mat-icon>home</mat-icon>`,
	imports: [ MatIcon ]
} )
class TestHostComponent {
}

function iconClasses( config: Parameters<typeof provideXiriServices>[0] ): DOMTokenList {
	TestBed.configureTestingModule( { imports: [ TestHostComponent ], providers: [ provideXiriServices( config ) ] } );
	const fixture = TestBed.createComponent( TestHostComponent );
	fixture.detectChanges();
	return fixture.nativeElement.querySelector( 'mat-icon' ).classList;
}

describe( 'provideXiriServices icon font set', () => {
	it( 'defaults mat-icon to material-symbols-outlined', () => {
		const cls = iconClasses( { api: '/api/' } );
		expect( cls ).toContain( 'material-symbols-outlined' );
		expect( cls ).toContain( 'mat-ligature-font' );
	} );

	it( 'uses the configured iconFontSet', () => {
		expect( iconClasses( { api: '/api/', iconFontSet: 'material-symbols-rounded' } ) ).toContain( 'material-symbols-rounded' );
	} );

	it( 'leaves the font set to Material with iconFontSet: null', () => {
		// jsdom has no document.fonts, so Material's inference falls back to material-icons.
		expect( iconClasses( { api: '/api/', iconFontSet: null } ) ).not.toContain( 'material-symbols-outlined' );
	} );
} );
