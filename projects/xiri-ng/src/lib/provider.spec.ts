import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { provideXiriServices, XiriServicesConfig } from './provider';

@Component( {
	template: `<mat-icon>home</mat-icon>`,
	imports: [ MatIcon ]
} )
class TestHostComponent {
}

function iconClasses( config: XiriServicesConfig ): DOMTokenList {
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
		// jsdom has no document.fonts, so Material's own inference yields material-icons.
		const cls = iconClasses( { api: '/api/', iconFontSet: null } );
		expect( cls ).toContain( 'material-icons' );
		expect( cls ).not.toContain( 'material-symbols-outlined' );
	} );

	// The registry is root-wide: a lazy route registering its own api must not reset the app's icon set.
	it( 'keeps the first font set when a child injector calls provideXiriServices again', () => {
		TestBed.configureTestingModule( { providers: [ provideXiriServices( { api: '/api/', iconFontSet: 'material-symbols-rounded' } ) ] } );
		const registry = TestBed.inject( MatIconRegistry );

		createEnvironmentInjector( [ provideXiriServices( { api: '/feature-api/' } ) ], TestBed.inject( EnvironmentInjector ) );

		expect( registry.getDefaultFontSetClass() ).toContain( 'material-symbols-rounded' );
	} );

	it( 'keeps iconFontSet: null from the app config when a child injector calls provideXiriServices again', () => {
		TestBed.configureTestingModule( { providers: [ provideXiriServices( { api: '/api/', iconFontSet: null } ) ] } );
		const registry = TestBed.inject( MatIconRegistry );

		createEnvironmentInjector( [ provideXiriServices( { api: '/feature-api/' } ) ], TestBed.inject( EnvironmentInjector ) );

		expect( registry.getDefaultFontSetClass() ).not.toContain( 'material-symbols-outlined' );
	} );
} );
