import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { XiriEmptyStateComponent, XiriEmptyStateSettings } from './empty-state.component';
import { XiriButtonResult } from '../button/button.component';
import { provideXiriServices } from '../provider';

@Component( {
	template: `<xiri-empty-state [settings]="settings()" (buttonResult)="onButtonResult($event)"/>`,
	imports: [ XiriEmptyStateComponent ]
} )
class TestHostComponent {
	settings = signal<XiriEmptyStateSettings>( {
		icon: 'inbox',
		title: 'No items found',
		description: 'Try adjusting your filters'
	} );
	lastResult: XiriButtonResult | null = null;
	onButtonResult = vi.fn( ( result: XiriButtonResult ) => {
		this.lastResult = result;
	} );
}

describe( 'XiriEmptyStateComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach( async () => {
		await TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [ provideRouter( [] ), provideHttpClient(), provideXiriServices( { api: '/api/' } ) ]
		} ).compileComponents();

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		const el = fixture.nativeElement.querySelector( 'xiri-empty-state' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render icon when provided', () => {
		const icon = fixture.nativeElement.querySelector( 'mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'inbox' );
	} );

	it( 'should apply iconColor class with default "gray"', () => {
		const icon = fixture.nativeElement.querySelector( '.empty-state > mat-icon' );
		expect( icon.classList.contains( 'gray' ) ).toBe( true );
	} );

	it( 'should apply custom iconColor', () => {
		host.settings.set( { icon: 'inbox', title: 'Test', iconColor: 'primary' } );
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector( '.empty-state > mat-icon' );
		expect( icon.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should render title', () => {
		const title = fixture.nativeElement.querySelector( '.title' );
		expect( title.textContent.trim() ).toBe( 'No items found' );
	} );

	it( 'should render description when provided', () => {
		const desc = fixture.nativeElement.querySelector( '.description' );
		expect( desc ).toBeTruthy();
		expect( desc.textContent.trim() ).toBe( 'Try adjusting your filters' );
	} );

	it( 'should not render description when not provided', () => {
		host.settings.set( { title: 'Empty' } );
		fixture.detectChanges();

		const desc = fixture.nativeElement.querySelector( '.description' );
		expect( desc ).toBeFalsy();
	} );

	it( 'should not render icon when not provided', () => {
		host.settings.set( { title: 'No Icon' } );
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector( '.empty-state > mat-icon' );
		expect( icon ).toBeFalsy();
	} );

	it( 'should not render button when not provided', () => {
		const action = fixture.nativeElement.querySelector( '.action' );
		expect( action ).toBeFalsy();
	} );

	it( 'should render button when provided', () => {
		host.settings.set( {
			title: 'Empty',
			button: { text: 'Add Item', type: 'raised', action: 'link', url: '/add' }
		} );
		fixture.detectChanges();

		const action = fixture.nativeElement.querySelector( '.action' );
		expect( action ).toBeTruthy();

		const button = fixture.nativeElement.querySelector( 'xiri-button' );
		expect( button ).toBeTruthy();
	} );

	it( 'should handle all optional fields missing', () => {
		host.settings.set( { title: 'Minimal' } );
		fixture.detectChanges();

		const title = fixture.nativeElement.querySelector( '.title' );
		expect( title.textContent.trim() ).toBe( 'Minimal' );

		expect( fixture.nativeElement.querySelector( '.empty-state > mat-icon' ) ).toBeFalsy();
		expect( fixture.nativeElement.querySelector( '.description' ) ).toBeFalsy();
		expect( fixture.nativeElement.querySelector( '.action' ) ).toBeFalsy();
	} );

	it( 'should handle empty string title', () => {
		host.settings.set( { title: '' } );
		fixture.detectChanges();

		const title = fixture.nativeElement.querySelector( '.title' );
		expect( title.textContent.trim() ).toBe( '' );
	} );
} );
