import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriDividerComponent, XiriDividerSettings } from './divider.component';

@Component( {
	template: `<xiri-divider [settings]="settings()"/>`,
	imports: [ XiriDividerComponent ]
} )
class TestHostComponent {
	settings = signal<XiriDividerSettings>( { text: 'Section', icon: 'star', spacing: 'normal' } );
}

describe( 'XiriDividerComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach( async () => {
		await TestBed.configureTestingModule( {
			imports: [ TestHostComponent ]
		} ).compileComponents();

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		const el = fixture.nativeElement.querySelector( 'xiri-divider' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render text and icon when both provided', () => {
		const label = fixture.nativeElement.querySelector( '.divider-label' );
		expect( label ).toBeTruthy();
		expect( label.textContent ).toContain( 'Section' );

		const icon = fixture.nativeElement.querySelector( 'mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'star' );
	} );

	it( 'should render two mat-divider elements when text or icon is present', () => {
		const dividers = fixture.nativeElement.querySelectorAll( 'mat-divider' );
		expect( dividers.length ).toBe( 2 );
	} );

	it( 'should render only one mat-divider when no text or icon', () => {
		host.settings.set( {} );
		fixture.detectChanges();

		const dividers = fixture.nativeElement.querySelectorAll( 'mat-divider' );
		expect( dividers.length ).toBe( 1 );

		const label = fixture.nativeElement.querySelector( '.divider-label' );
		expect( label ).toBeFalsy();
	} );

	it( 'should apply spacing class', () => {
		const wrapper = fixture.nativeElement.querySelector( '.xiri-divider' );
		expect( wrapper.classList.contains( 'normal' ) ).toBe( true );
	} );

	it( 'should default spacing to normal when not specified', () => {
		host.settings.set( { text: 'Hello' } );
		fixture.detectChanges();

		const wrapper = fixture.nativeElement.querySelector( '.xiri-divider' );
		expect( wrapper.classList.contains( 'normal' ) ).toBe( true );
	} );

	it( 'should apply compact spacing', () => {
		host.settings.set( { text: 'Compact', spacing: 'compact' } );
		fixture.detectChanges();

		const wrapper = fixture.nativeElement.querySelector( '.xiri-divider' );
		expect( wrapper.classList.contains( 'compact' ) ).toBe( true );
	} );

	it( 'should apply large spacing', () => {
		host.settings.set( { text: 'Large', spacing: 'large' } );
		fixture.detectChanges();

		const wrapper = fixture.nativeElement.querySelector( '.xiri-divider' );
		expect( wrapper.classList.contains( 'large' ) ).toBe( true );
	} );

	it( 'should render with only icon, no text', () => {
		host.settings.set( { icon: 'info' } );
		fixture.detectChanges();

		const label = fixture.nativeElement.querySelector( '.divider-label' );
		expect( label ).toBeTruthy();

		const icon = fixture.nativeElement.querySelector( 'mat-icon' );
		expect( icon.textContent.trim() ).toBe( 'info' );
	} );

	it( 'should render with only text, no icon', () => {
		host.settings.set( { text: 'Only text' } );
		fixture.detectChanges();

		const label = fixture.nativeElement.querySelector( '.divider-label' );
		expect( label ).toBeTruthy();
		expect( label.textContent ).toContain( 'Only text' );

		const icons = fixture.nativeElement.querySelectorAll( 'mat-icon' );
		expect( icons.length ).toBe( 0 );
	} );
} );
