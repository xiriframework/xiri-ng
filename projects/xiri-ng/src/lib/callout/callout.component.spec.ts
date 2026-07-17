import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { XiriCalloutComponent, XiriCalloutSettings } from './callout.component';
import { XiriButtonResult } from '../button/button.component';
import { provideXiriServices } from '../provider';

@Component( {
	template: `<xiri-callout [settings]="settings()" (buttonResult)="onButtonResult($event)"/>`,
	imports: [ XiriCalloutComponent ]
} )
class TestHostComponent {
	settings = signal<XiriCalloutSettings>( {
		tone: 'info',
		text: 'Just so you know.'
	} );
	lastResult: XiriButtonResult | null = null;
	onButtonResult = vi.fn( ( result: XiriButtonResult ) => {
		this.lastResult = result;
	} );
}

describe( 'XiriCalloutComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach( async () => {
		await TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [ provideRouter( [] ), provideHttpClient( withXhr() ), provideXiriServices( { api: '/api/' } ) ]
		} ).compileComponents();

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
	} );

	function callout(): HTMLElement {
		return fixture.nativeElement.querySelector( '.callout' );
	}

	it( 'should create and render text', () => {
		expect( callout() ).toBeTruthy();
		expect( callout().querySelector( '.text' )!.textContent!.trim() ).toBe( 'Just so you know.' );
	} );

	it( 'should apply the tone class', () => {
		host.settings.set( { tone: 'warning', text: 'Careful.' } );
		fixture.detectChanges();
		expect( callout().classList.contains( 'tone-warning' ) ).toBe( true );
	} );

	it( 'should use role="alert" only for error tone, otherwise role="note"', () => {
		expect( callout().getAttribute( 'role' ) ).toBe( 'note' );

		host.settings.set( { tone: 'error', text: 'Boom.' } );
		fixture.detectChanges();
		expect( callout().getAttribute( 'role' ) ).toBe( 'alert' );
	} );

	it( 'should render title and icon only when provided', () => {
		expect( callout().querySelector( '.title' ) ).toBeFalsy();
		expect( callout().querySelector( '.icon' ) ).toBeFalsy();

		host.settings.set( { tone: 'success', text: 'Done.', title: 'Saved', icon: 'check_circle' } );
		fixture.detectChanges();
		expect( callout().querySelector( '.title' )!.textContent!.trim() ).toBe( 'Saved' );
		expect( callout().querySelector( '.icon mat-icon' )!.textContent!.trim() ).toBe( 'check_circle' );
	} );

	it( 'should render action buttons when provided', () => {
		host.settings.set( {
			tone: 'info',
			text: 'Update available.',
			actions: [ { text: 'Reload', type: 'stroked', action: 'link', url: '/x' } ]
		} );
		fixture.detectChanges();
		expect( callout().querySelectorAll( 'xiri-button' ).length ).toBe( 1 );
	} );

	it( 'should not render a dismiss button unless dismissible', () => {
		expect( callout().querySelector( '.dismiss' ) ).toBeFalsy();

		host.settings.set( { tone: 'info', text: 'X', dismissible: true } );
		fixture.detectChanges();
		expect( callout().querySelector( '.dismiss' ) ).toBeTruthy();
	} );

	it( 'should remove the callout locally when dismissed', () => {
		host.settings.set( { tone: 'info', text: 'X', dismissible: true } );
		fixture.detectChanges();

		( callout().querySelector( '.dismiss' ) as HTMLButtonElement ).click();
		fixture.detectChanges();

		expect( callout() ).toBeFalsy();
	} );

	it( 'should apply the compact class', () => {
		host.settings.set( { tone: 'info', text: 'X', compact: true } );
		fixture.detectChanges();
		expect( callout().classList.contains( 'compact' ) ).toBe( true );
	} );
} );
