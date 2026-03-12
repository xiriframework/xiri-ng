import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from './page-header.component';
import { provideXiriServices } from '../provider';

@Component( {
	template: `<xiri-page-header [settings]="settings()"/>`,
	imports: [ XiriPageHeaderComponent ]
} )
class TestHostComponent {
	settings = signal<XiriPageHeaderSettings>( {
		title: 'Dashboard',
		subtitle: 'Overview of your data',
		icon: 'dashboard',
		iconColor: 'primary'
	} );
}

describe( 'XiriPageHeaderComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-page-header' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render title', () => {
		const h1 = fixture.nativeElement.querySelector( 'h1' );
		expect( h1 ).toBeTruthy();
		expect( h1.textContent.trim() ).toBe( 'Dashboard' );
	} );

	it( 'should render subtitle when provided', () => {
		const p = fixture.nativeElement.querySelector( '.page-header-text p' );
		expect( p ).toBeTruthy();
		expect( p.textContent.trim() ).toBe( 'Overview of your data' );
	} );

	it( 'should not render subtitle when not provided', () => {
		host.settings.set( { title: 'No Subtitle' } );
		fixture.detectChanges();

		const p = fixture.nativeElement.querySelector( '.page-header-text p' );
		expect( p ).toBeFalsy();
	} );

	it( 'should render icon when provided', () => {
		const iconDiv = fixture.nativeElement.querySelector( '.page-header-icon' );
		expect( iconDiv ).toBeTruthy();

		const icon = iconDiv.querySelector( 'mat-icon' );
		expect( icon.textContent.trim() ).toBe( 'dashboard' );
	} );

	it( 'should apply iconColor class', () => {
		const iconDiv = fixture.nativeElement.querySelector( '.page-header-icon' );
		expect( iconDiv.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should default iconColor to primary when not specified', () => {
		host.settings.set( { title: 'Test', icon: 'settings' } );
		fixture.detectChanges();

		const iconDiv = fixture.nativeElement.querySelector( '.page-header-icon' );
		expect( iconDiv.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should not render icon when not provided', () => {
		host.settings.set( { title: 'No Icon' } );
		fixture.detectChanges();

		const iconDiv = fixture.nativeElement.querySelector( '.page-header-icon' );
		expect( iconDiv ).toBeFalsy();
	} );

	it( 'should not render buttonline when buttons not provided', () => {
		const buttonline = fixture.nativeElement.querySelector( 'xiri-buttonline' );
		expect( buttonline ).toBeFalsy();
	} );

	it( 'should render buttonline when buttons are provided', () => {
		host.settings.set( {
			title: 'With Buttons',
			buttons: {
				buttons: [
					{ text: 'Add', type: 'raised', action: 'link', url: '/add' }
				],
				class: 'right'
			}
		} );
		fixture.detectChanges();

		const buttonline = fixture.nativeElement.querySelector( 'xiri-buttonline' );
		expect( buttonline ).toBeTruthy();
	} );

	it( 'should render with only title (minimal settings)', () => {
		host.settings.set( { title: 'Minimal' } );
		fixture.detectChanges();

		const h1 = fixture.nativeElement.querySelector( 'h1' );
		expect( h1.textContent.trim() ).toBe( 'Minimal' );

		expect( fixture.nativeElement.querySelector( '.page-header-icon' ) ).toBeFalsy();
		expect( fixture.nativeElement.querySelector( '.page-header-text p' ) ).toBeFalsy();
		expect( fixture.nativeElement.querySelector( 'xiri-buttonline' ) ).toBeFalsy();
	} );

	it( 'should handle empty string title', () => {
		host.settings.set( { title: '' } );
		fixture.detectChanges();

		const h1 = fixture.nativeElement.querySelector( 'h1' );
		expect( h1.textContent.trim() ).toBe( '' );
	} );

	it( 'should update when settings change', () => {
		host.settings.set( { title: 'Updated Title', subtitle: 'Updated Subtitle' } );
		fixture.detectChanges();

		expect( fixture.nativeElement.querySelector( 'h1' ).textContent.trim() ).toBe( 'Updated Title' );
		expect( fixture.nativeElement.querySelector( '.page-header-text p' ).textContent.trim() ).toBe( 'Updated Subtitle' );
	} );

	it( 'should apply custom iconColor', () => {
		host.settings.set( { title: 'Test', icon: 'home', iconColor: 'warn' } );
		fixture.detectChanges();

		const iconDiv = fixture.nativeElement.querySelector( '.page-header-icon' );
		expect( iconDiv.classList.contains( 'warn' ) ).toBe( true );
	} );
} );
