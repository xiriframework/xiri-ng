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
