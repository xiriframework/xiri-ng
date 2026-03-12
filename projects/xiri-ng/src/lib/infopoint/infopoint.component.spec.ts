import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { XiriInfopointComponent, XiriInfopointSettings } from './infopoint.component';

@Component( {
	template: `<xiri-infopoint [settings]="settings()"/>`,
	imports: [ XiriInfopointComponent ]
} )
class TestHostComponent {
	settings = signal<XiriInfopointSettings>( {
		text: 'Users',
		info: '1,234',
		icon: 'people',
		iconColor: 'primary'
	} );
}

describe( 'XiriInfopointComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach( async () => {
		await TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [ provideRouter( [] ) ]
		} ).compileComponents();

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		const el = fixture.nativeElement.querySelector( 'xiri-infopoint' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render inside a mat-card', () => {
		const card = fixture.nativeElement.querySelector( 'mat-card' );
		expect( card ).toBeTruthy();
	} );

	it( 'should render text', () => {
		const text = fixture.nativeElement.querySelector( '.text' );
		expect( text ).toBeTruthy();
		expect( text.textContent.trim() ).toBe( 'Users' );
	} );

	it( 'should render info', () => {
		const info = fixture.nativeElement.querySelector( '.info' );
		expect( info ).toBeTruthy();
		expect( info.textContent.trim() ).toBe( '1,234' );
	} );

	it( 'should render icon', () => {
		const icon = fixture.nativeElement.querySelector( '.icon mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'people' );
	} );

	it( 'should apply iconColor class', () => {
		const iconDiv = fixture.nativeElement.querySelector( '.icon' );
		expect( iconDiv.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should not have isLink class when url is not provided', () => {
		const point = fixture.nativeElement.querySelector( '.point' );
		expect( point.classList.contains( 'isLink' ) ).toBe( false );
	} );

	it( 'should have isLink class when url is provided', () => {
		host.settings.set( {
			text: 'Users',
			info: '1,234',
			icon: 'people',
			iconColor: 'primary',
			url: '/users'
		} );
		fixture.detectChanges();

		const point = fixture.nativeElement.querySelector( '.point' );
		expect( point.classList.contains( 'isLink' ) ).toBe( true );
	} );

	it( 'should apply dense class when dense is true', () => {
		host.settings.set( {
			text: 'Dense',
			info: '42',
			icon: 'info',
			iconColor: 'accent',
			dense: true
		} );
		fixture.detectChanges();

		const content = fixture.nativeElement.querySelector( 'mat-card-content' );
		expect( content.classList.contains( 'dense' ) ).toBe( true );
	} );

	it( 'should not apply dense class when dense is not set', () => {
		const content = fixture.nativeElement.querySelector( 'mat-card-content' );
		expect( content.classList.contains( 'dense' ) ).toBe( false );
	} );

	it( 'should render with custom fontSet', () => {
		host.settings.set( {
			text: 'Custom',
			info: 'Info',
			icon: 'custom_icon',
			iconColor: 'primary',
			iconSet: 'custom-icons'
		} );
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector( '.icon mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'custom_icon' );
	} );

	it( 'should not render text div when text is empty', () => {
		host.settings.set( {
			text: '',
			info: 'Only info',
			icon: 'info',
			iconColor: 'primary'
		} );
		fixture.detectChanges();

		const text = fixture.nativeElement.querySelector( '.text' );
		expect( text ).toBeFalsy();
	} );

	it( 'should update when settings change', () => {
		host.settings.set( {
			text: 'New Text',
			info: 'New Info',
			icon: 'new_icon',
			iconColor: 'warn'
		} );
		fixture.detectChanges();

		expect( fixture.nativeElement.querySelector( '.text' ).textContent.trim() ).toBe( 'New Text' );
		expect( fixture.nativeElement.querySelector( '.info' ).textContent.trim() ).toBe( 'New Info' );
	} );
} );
