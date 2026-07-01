import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriImagetextComponent, XiriImagetextSettings } from './imagetext.component';

@Component( {
	template: `<xiri-imagetext [settings]="settings()"/>`,
	imports: [ XiriImagetextComponent ]
} )
class TestHostComponent {
	settings = signal<XiriImagetextSettings>( {
		url: 'https://example.com/image.png',
		info: 'Sample image',
		header: 'Image Title',
		headerSub: 'Subtitle',
		headerIcon: 'photo',
		headerIconColor: 'primary'
	} );
}

describe( 'XiriImagetextComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-imagetext' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render inside a mat-card', () => {
		const card = fixture.nativeElement.querySelector( 'mat-card' );
		expect( card ).toBeTruthy();
	} );

	it( 'should render header when provided', () => {
		const title = fixture.nativeElement.querySelector( 'mat-card-title' );
		expect( title ).toBeTruthy();
		expect( title.textContent.trim() ).toBe( 'Image Title' );
	} );

	it( 'should render headerSub when provided', () => {
		const subtitle = fixture.nativeElement.querySelector( 'mat-card-subtitle' );
		expect( subtitle ).toBeTruthy();
		expect( subtitle.textContent.trim() ).toBe( 'Subtitle' );
	} );

	it( 'should render headerIcon when provided', () => {
		const icon = fixture.nativeElement.querySelector( '.header-image mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'photo' );
	} );

	it( 'should apply headerIconColor', () => {
		const icon = fixture.nativeElement.querySelector( '.header-image mat-icon' );
		expect( icon.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should default headerIconColor to primary', () => {
		host.settings.set( { url: 'test.png', info: 'test', headerIcon: 'photo' } );
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector( '.header-image mat-icon' );
		expect( icon.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should not render header elements when not provided', () => {
		host.settings.set( { url: 'test.png', info: 'test' } );
		fixture.detectChanges();

		expect( fixture.nativeElement.querySelector( 'mat-card-title' ) ).toBeFalsy();
		expect( fixture.nativeElement.querySelector( 'mat-card-subtitle' ) ).toBeFalsy();
		expect( fixture.nativeElement.querySelector( '.header-image' ) ).toBeFalsy();
	} );

	it( 'should render img with correct src and alt', () => {
		const img: HTMLImageElement = fixture.nativeElement.querySelector( 'img#ximg' );
		expect( img ).toBeTruthy();
		expect( img.getAttribute( 'src' ) ).toBe( 'https://example.com/image.png' );
		expect( img.getAttribute( 'alt' ) ).toBe( 'Sample image' );
	} );

	it( 'should start with loading=true', () => {
		const component = fixture.debugElement.children[0].componentInstance as XiriImagetextComponent;
		expect( component.loading() ).toBe( true );
	} );

	it( 'should show spinner while loading', () => {
		const spinner = fixture.nativeElement.querySelector( 'mat-spinner' );
		expect( spinner ).toBeTruthy();
		expect( spinner.hidden ).toBe( false );
	} );

	it( 'should hide image while loading', () => {
		const img: HTMLImageElement = fixture.nativeElement.querySelector( 'img#ximg' );
		expect( img.hidden ).toBe( true );
	} );

	it( 'should set loading to false on image load', () => {
		const component = fixture.debugElement.children[0].componentInstance as XiriImagetextComponent;
		const img: HTMLImageElement = fixture.nativeElement.querySelector( 'img#ximg' );

		img.dispatchEvent( new Event( 'load' ) );
		fixture.detectChanges();

		expect( component.loading() ).toBe( false );
	} );

	it( 'should hide spinner after image loads', () => {
		const img: HTMLImageElement = fixture.nativeElement.querySelector( 'img#ximg' );
		img.dispatchEvent( new Event( 'load' ) );
		fixture.detectChanges();

		const spinner = fixture.nativeElement.querySelector( 'mat-spinner' );
		expect( spinner.hidden ).toBe( true );
	} );

	it( 'should show image after loading completes', () => {
		const img: HTMLImageElement = fixture.nativeElement.querySelector( 'img#ximg' );
		img.dispatchEvent( new Event( 'load' ) );
		fixture.detectChanges();

		expect( img.hidden ).toBe( false );
	} );
} );
