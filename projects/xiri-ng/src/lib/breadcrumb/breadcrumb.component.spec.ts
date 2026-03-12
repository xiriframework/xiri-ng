import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from './breadcrumb.component';

@Component( {
	template: `<xiri-breadcrumb [settings]="items()"/>`,
	imports: [ XiriBreadcrumbComponent ]
} )
class TestHostComponent {
	items = signal<XiriBreadcrumbItem[]>( [
		{ label: 'Home', link: '/', icon: 'home' },
		{ label: 'Products', link: '/products' },
		{ label: 'Detail' }
	] );
}

describe( 'XiriBreadcrumbComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-breadcrumb' );
		expect( el ).toBeTruthy();
	} );

	it( 'should have breadcrumb nav with aria-label', () => {
		const nav = fixture.nativeElement.querySelector( 'nav.breadcrumb' );
		expect( nav ).toBeTruthy();
		expect( nav.getAttribute( 'aria-label' ) ).toBe( 'Breadcrumb' );
	} );

	it( 'should render all breadcrumb items', () => {
		const items = fixture.nativeElement.querySelectorAll( 'li' );
		expect( items.length ).toBe( 3 );
	} );

	it( 'should mark the last item as active', () => {
		const items = fixture.nativeElement.querySelectorAll( 'li' );
		expect( items[2].classList.contains( 'active' ) ).toBe( true );
		expect( items[0].classList.contains( 'active' ) ).toBe( false );
	} );

	it( 'should render links for items with link property', () => {
		const links = fixture.nativeElement.querySelectorAll( 'li a' );
		expect( links.length ).toBeGreaterThanOrEqual( 1 );
	} );

	it( 'should render span for items without link', () => {
		const lastItem = fixture.nativeElement.querySelectorAll( 'li' )[2];
		const span = lastItem.querySelector( 'span' );
		expect( span ).toBeTruthy();
		expect( span.textContent ).toContain( 'Detail' );
	} );

	it( 'should render icon when provided', () => {
		const firstItem = fixture.nativeElement.querySelectorAll( 'li' )[0];
		const icon = firstItem.querySelector( 'mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'home' );
	} );

	it( 'should render separator icons between items but not after the last', () => {
		const separators = fixture.nativeElement.querySelectorAll( '.separator' );
		expect( separators.length ).toBe( 2 );
	} );

	it( 'should render external links with href and target="_blank"', () => {
		host.items.set( [
			{ label: 'External', link: 'https://example.com', extern: true },
			{ label: 'Current' }
		] );
		fixture.detectChanges();

		const link = fixture.nativeElement.querySelector( 'a[href="https://example.com"]' );
		expect( link ).toBeTruthy();
		expect( link.getAttribute( 'target' ) ).toBe( '_blank' );
		expect( link.getAttribute( 'rel' ) ).toBe( 'noopener' );
	} );

	it( 'should handle empty array', () => {
		host.items.set( [] );
		fixture.detectChanges();

		const items = fixture.nativeElement.querySelectorAll( 'li' );
		expect( items.length ).toBe( 0 );
	} );

	it( 'should handle single item', () => {
		host.items.set( [ { label: 'Only' } ] );
		fixture.detectChanges();

		const items = fixture.nativeElement.querySelectorAll( 'li' );
		expect( items.length ).toBe( 1 );
		expect( items[0].classList.contains( 'active' ) ).toBe( true );

		const separators = fixture.nativeElement.querySelectorAll( '.separator' );
		expect( separators.length ).toBe( 0 );
	} );
} );
