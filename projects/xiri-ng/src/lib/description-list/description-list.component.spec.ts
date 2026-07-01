import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriDescriptionListComponent, XiriDescriptionListSettings } from './description-list.component';

@Component( {
	template: `<xiri-description-list [settings]="settings()"/>`,
	imports: [ XiriDescriptionListComponent ]
} )
class TestHostComponent {
	settings = signal<XiriDescriptionListSettings>( {
		items: [
			{ label: 'Name', value: 'John Doe' },
			{ label: 'Email', value: 'john@example.com', type: 'link' },
			{ label: 'Status', value: 'Active', type: 'badge', color: 'success' }
		]
	} );
}

describe( 'XiriDescriptionListComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-description-list' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render all items', () => {
		const items = fixture.nativeElement.querySelectorAll( '.dl-item' );
		expect( items.length ).toBe( 3 );
	} );

	it( 'should render labels in dt elements', () => {
		const dts = fixture.nativeElement.querySelectorAll( 'dt' );
		expect( dts[0].textContent ).toContain( 'Name' );
		expect( dts[1].textContent ).toContain( 'Email' );
		expect( dts[2].textContent ).toContain( 'Status' );
	} );

	it( 'should render default text type value', () => {
		const firstDd = fixture.nativeElement.querySelectorAll( 'dd' )[0];
		expect( firstDd.textContent ).toContain( 'John Doe' );
	} );

	it( 'should render link type as anchor', () => {
		const linkDd = fixture.nativeElement.querySelectorAll( 'dd' )[1];
		const link = linkDd.querySelector( 'a' );
		expect( link ).toBeTruthy();
		expect( link.getAttribute( 'href' ) ).toBe( 'john@example.com' );
		expect( link.getAttribute( 'target' ) ).toBe( '_blank' );
	} );

	it( 'should render badge type with class', () => {
		const badgeDd = fixture.nativeElement.querySelectorAll( 'dd' )[2];
		const badge = badgeDd.querySelector( '.dl-badge' );
		expect( badge ).toBeTruthy();
		expect( badge.textContent.trim() ).toBe( 'Active' );
		expect( badge.classList.contains( 'success' ) ).toBe( true );
	} );

	it( 'should render html type with innerHTML', () => {
		host.settings.set( {
			items: [ { label: 'Rich', value: '<strong>Bold</strong>', type: 'html' } ]
		} );
		fixture.detectChanges();

		const dd = fixture.nativeElement.querySelector( 'dd' );
		const span = dd.querySelector( 'span' );
		expect( span ).toBeTruthy();
	} );

	it( 'should render icon in dt when provided', () => {
		host.settings.set( {
			items: [ { label: 'Phone', value: '123', icon: 'phone' } ]
		} );
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector( 'dt mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'phone' );
	} );

	it( 'should not render icon in dt when not provided', () => {
		const icons = fixture.nativeElement.querySelectorAll( 'dt mat-icon' );
		expect( icons.length ).toBe( 0 );
	} );

	describe( 'computed layoutClass', () => {
		it( 'should default to "stacked cols-2"', () => {
			const component = fixture.debugElement.children[0].componentInstance as XiriDescriptionListComponent;
			expect( component.layoutClass() ).toBe( 'stacked cols-2' );
		} );

		it( 'should use specified layout and columns', () => {
			host.settings.set( {
				items: [ { label: 'A', value: 'B' } ],
				layout: 'horizontal',
				columns: 3
			} );
			fixture.detectChanges();

			const component = fixture.debugElement.children[0].componentInstance as XiriDescriptionListComponent;
			expect( component.layoutClass() ).toBe( 'horizontal cols-3' );
		} );

		it( 'should apply layout class to dl element', () => {
			const dl: HTMLElement = fixture.nativeElement.querySelector( '.description-list' );
			expect( dl.classList.contains( 'stacked' ) ).toBe( true );
			expect( dl.classList.contains( 'cols-2' ) ).toBe( true );
		} );

		it( 'should use 1 column', () => {
			host.settings.set( {
				items: [ { label: 'A', value: 'B' } ],
				columns: 1
			} );
			fixture.detectChanges();

			const component = fixture.debugElement.children[0].componentInstance as XiriDescriptionListComponent;
			expect( component.layoutClass() ).toBe( 'stacked cols-1' );
		} );
	} );

	it( 'should render em-dash for empty value in default type', () => {
		host.settings.set( {
			items: [ { label: 'Missing', value: '' } ]
		} );
		fixture.detectChanges();

		const dd = fixture.nativeElement.querySelector( 'dd' );
		expect( dd.textContent ).toContain( '\u2014' );
	} );

	it( 'should handle empty items array', () => {
		host.settings.set( { items: [] } );
		fixture.detectChanges();

		const items = fixture.nativeElement.querySelectorAll( '.dl-item' );
		expect( items.length ).toBe( 0 );
	} );

	it( 'should apply color class to icon', () => {
		host.settings.set( {
			items: [ { label: 'Colored', value: 'Test', icon: 'star', color: 'warn' } ]
		} );
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector( 'dt mat-icon' );
		expect( icon.classList.contains( 'warn' ) ).toBe( true );
	} );

	it( 'should set --dl-cols CSS variable', () => {
		const dl: HTMLElement = fixture.nativeElement.querySelector( '.description-list' );
		expect( dl.style.getPropertyValue( '--dl-cols' ) ).toBe( '2' );
	} );

	it( 'should update --dl-cols when columns change', () => {
		host.settings.set( { items: [ { label: 'A', value: 'B' } ], columns: 3 } );
		fixture.detectChanges();

		const dl: HTMLElement = fixture.nativeElement.querySelector( '.description-list' );
		expect( dl.style.getPropertyValue( '--dl-cols' ) ).toBe( '3' );
	} );
} );
