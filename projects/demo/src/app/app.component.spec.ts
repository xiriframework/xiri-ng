import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';
import { AppComponent } from './app.component';

describe( 'AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;
	let breakpoint$: BehaviorSubject<BreakpointState>;

	beforeEach( async () => {
		breakpoint$ = new BehaviorSubject<BreakpointState>( { matches: true, breakpoints: {} } );

		await TestBed.configureTestingModule( {
			imports: [ AppComponent ],
			providers: [
				// Like main.ts: without zone.js a resize must still reach the template.
				provideZonelessChangeDetection(),
				provideRouter( [] ),
				{ provide: BreakpointObserver, useValue: { observe: () => breakpoint$ } },
			],
		} ).compileComponents();

		fixture = TestBed.createComponent( AppComponent );
		await fixture.whenStable();
	} );

	// The menu button touched the title ("XIRI Demo") — 0px between button and text.
	it( 'keeps a gap between the menu button and the title', () => {
		expect( getComputedStyle( fixture.nativeElement.querySelector( '.nav-logo' ) ).marginLeft ).toBe( 'var(--xiri-spacing-sm, 8px)' );
	} );

	// The overlay drawer started at 48px under a 52px (phone) or 60px (tablet) toolbar and hid the top of the
	// first entry. One toolbar height everywhere, and the drawer gap matches it.
	it( 'starts the overlay drawer exactly below the toolbar', () => {
		const toolbar: HTMLElement = fixture.nativeElement.querySelector( 'mat-toolbar' );
		expect( getComputedStyle( toolbar ).getPropertyValue( '--mat-toolbar-mobile-height' ).trim() ).toBe( 'var(--mat-toolbar-standard-height)' );
		expect( sidenav().fixedTopGap ).toBe( 60 );
	} );

	// The active first entry (a pill) sat flush against the toolbar edge: keep Material's list padding.
	it( 'keeps the list padding above the first entry', () => {
		expect( getComputedStyle( fixture.nativeElement.querySelector( 'mat-sidenav mat-nav-list' ) ).paddingTop ).not.toBe( '0px' );
	} );

	function sidenav(): MatSidenav {
		return fixture.debugElement.query( By.directive( MatSidenav ) ).componentInstance;
	}

	async function resize( small: boolean ): Promise<void> {
		breakpoint$.next( { matches: small, breakpoints: {} } );
		await fixture.whenStable();
	}

	it( 'starts as a closed overlay on a small screen', () => {
		expect( sidenav().mode ).toBe( 'over' );
		expect( sidenav().opened ).toBe( false );
	} );

	it( 'switches to an open side drawer when the screen grows', async () => {
		await resize( false );

		expect( sidenav().mode ).toBe( 'side' );
		expect( sidenav().opened ).toBe( true );
		expect( fixture.nativeElement.querySelector( '.main-container' ).classList ).not.toContain( 'nav-is-mobile' );
	} );

	it( 'switches back to a closed overlay when the screen shrinks again', async () => {
		await resize( false );
		expect( sidenav().mode ).toBe( 'side' );
		await resize( true );

		expect( sidenav().mode ).toBe( 'over' );
		expect( sidenav().opened ).toBe( false );
	} );
} );
