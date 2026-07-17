import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriStatusComponent, XiriStatusSettings } from './status.component';

@Component( {
	template: `<xiri-status [settings]="settings()"/>`,
	imports:  [ XiriStatusComponent ]
} )
class TestHostComponent {
	settings = signal<XiriStatusSettings>( { label: 'Online' } );
}

describe( 'XiriStatusComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	function el(): HTMLElement {
		return fixture.nativeElement.querySelector( 'xiri-status' );
	}

	beforeEach( async () => {
		await TestBed.configureTestingModule( {
			imports: [ TestHostComponent ]
		} ).compileComponents();

		fixture = TestBed.createComponent( TestHostComponent );
		host    = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		expect( el() ).toBeTruthy();
	} );

	it( 'should always render the label text in the DOM', () => {
		const label = el().querySelector( '.status-label' );
		expect( label ).toBeTruthy();
		expect( label!.textContent!.trim() ).toBe( 'Online' );
	} );

	it( 'should default to badge variant and neutral tone', () => {
		expect( el().classList.contains( 'variant-badge' ) ).toBe( true );
		expect( el().classList.contains( 'tone-neutral' ) ).toBe( true );
	} );

	it( 'should apply tone and variant as host classes', () => {
		host.settings.set( { label: 'Warning', tone: 'warning', variant: 'text' } );
		fixture.detectChanges();

		expect( el().classList.contains( 'tone-warning' ) ).toBe( true );
		expect( el().classList.contains( 'variant-text' ) ).toBe( true );
	} );

	it( 'should keep the label visible in dot variant with a decorative, hidden dot', () => {
		host.settings.set( { label: 'Busy', variant: 'dot', tone: 'error' } );
		fixture.detectChanges();

		const dot = el().querySelector( '.status-dot' );
		expect( dot ).toBeTruthy();
		expect( dot!.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
		expect( el().querySelector( '.status-label' )!.textContent!.trim() ).toBe( 'Busy' );
	} );

	it( 'should render an aria-hidden icon only when provided', () => {
		expect( el().querySelector( 'mat-icon' ) ).toBeNull();

		host.settings.set( { label: 'Done', icon: 'check_circle' } );
		fixture.detectChanges();

		const icon = el().querySelector( 'mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon!.textContent!.trim() ).toBe( 'check_circle' );
		expect( icon!.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
	} );

	it( 'should set role=status', () => {
		expect( el().getAttribute( 'role' ) ).toBe( 'status' );
	} );

	it( 'should not set aria-label unless provided (visible label carries the name)', () => {
		expect( el().getAttribute( 'aria-label' ) ).toBeNull();

		host.settings.set( { label: 'OK', ariaLabel: 'Connection is online' } );
		fixture.detectChanges();

		expect( el().getAttribute( 'aria-label' ) ).toBe( 'Connection is online' );
	} );

	it( 'should expose hint as title tooltip', () => {
		expect( el().getAttribute( 'title' ) ).toBeNull();

		host.settings.set( { label: 'Delayed', hint: 'Since 5 minutes' } );
		fixture.detectChanges();

		expect( el().getAttribute( 'title' ) ).toBe( 'Since 5 minutes' );
	} );
} );
