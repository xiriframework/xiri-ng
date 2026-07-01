import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriHeaderComponent, XiriHeaderSettings } from './header.component';

@Component( {
	template: `<xiri-header [settings]="settings()"/>`,
	imports: [ XiriHeaderComponent ]
} )
class TestHostComponent {
	settings = signal<XiriHeaderSettings>( { text: 'Test Header', color: 'primary', size: 'large' } );
}

describe( 'XiriHeaderComponent', () => {
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
		const headerEl = fixture.nativeElement.querySelector( 'xiri-header' );
		expect( headerEl ).toBeTruthy();
	} );

	it( 'should render the text', () => {
		const nameDiv: HTMLElement = fixture.nativeElement.querySelector( '.name' );
		expect( nameDiv.textContent.trim() ).toBe( 'Test Header' );
	} );

	it( 'should apply color and size classes', () => {
		const nameDiv: HTMLElement = fixture.nativeElement.querySelector( '.name' );
		expect( nameDiv.classList.contains( 'primary' ) ).toBe( true );
		expect( nameDiv.classList.contains( 'large' ) ).toBe( true );
	} );

	it( 'should update when settings change', () => {
		host.settings.set( { text: 'Updated', color: 'warn', size: 'small' } );
		fixture.detectChanges();

		const nameDiv: HTMLElement = fixture.nativeElement.querySelector( '.name' );
		expect( nameDiv.textContent.trim() ).toBe( 'Updated' );
		expect( nameDiv.classList.contains( 'warn' ) ).toBe( true );
		expect( nameDiv.classList.contains( 'small' ) ).toBe( true );
	} );

	it( 'should handle empty string values', () => {
		host.settings.set( { text: '', color: '', size: '' } );
		fixture.detectChanges();

		const nameDiv: HTMLElement = fixture.nativeElement.querySelector( '.name' );
		expect( nameDiv.textContent.trim() ).toBe( '' );
	} );

	it( 'should reflect changed text via OnPush with new object reference', () => {
		host.settings.set( { text: 'New Text', color: 'accent', size: 'medium' } );
		fixture.detectChanges();

		const nameDiv: HTMLElement = fixture.nativeElement.querySelector( '.name' );
		expect( nameDiv.textContent.trim() ).toBe( 'New Text' );
		expect( nameDiv.classList.contains( 'accent' ) ).toBe( true );
	} );
} );
