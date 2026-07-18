import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { XiriMultiStatComponent, XiriMultiStatSettings } from './multi-stat.component';
import { XiriDataService } from '../services/data.service';

// Steuerbarer Stub: jede Test-Response wird über postFn gesetzt.
let postFn: () => Observable<unknown> = () => of( { data: { items: [] } } );
const dataServiceStub = { post: () => postFn() };

@Component( {
	template: `<xiri-multi-stat [settings]="settings()"/>`,
	imports: [ XiriMultiStatComponent ]
} )
class TestHostComponent {
	settings = signal<XiriMultiStatSettings>( {
		items: [
			{ value: 12, label: 'Offen', icon: 'inventory', color: 'orange' },
			{ value: 45, label: 'Fertig', color: 'green' }
		]
	} );
}

describe( 'XiriMultiStatComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach( async () => {
		postFn = () => of( { data: { items: [] } } );
		await TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [
				provideRouter( [] ),
				{ provide: XiriDataService, useValue: dataServiceStub }
			]
		} ).compileComponents();

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		expect( fixture.nativeElement.querySelector( 'xiri-multi-stat' ) ).toBeTruthy();
	} );

	it( 'should render one item per number', () => {
		const items = fixture.nativeElement.querySelectorAll( '.multi-stat-item' );
		expect( items.length ).toBe( 2 );
	} );

	it( 'should render item values and labels', () => {
		const values = fixture.nativeElement.querySelectorAll( '.stat-value' );
		expect( values[ 0 ].textContent ).toContain( '12' );
		expect( values[ 1 ].textContent ).toContain( '45' );

		const labels = fixture.nativeElement.querySelectorAll( '.stat-label' );
		expect( labels[ 0 ].textContent.trim() ).toBe( 'Offen' );
		expect( labels[ 1 ].textContent.trim() ).toBe( 'Fertig' );
	} );

	it( 'should apply per-item color class to stat-value', () => {
		const values = fixture.nativeElement.querySelectorAll( '.stat-value' );
		expect( values[ 0 ].classList.contains( 'orange' ) ).toBe( true );
		expect( values[ 1 ].classList.contains( 'green' ) ).toBe( true );
	} );

	it( 'should render per-item icon', () => {
		const icon = fixture.nativeElement.querySelector( '.multi-stat-item .stat-icon mat-icon' );
		expect( icon.textContent.trim() ).toBe( 'inventory' );
	} );

	it( 'should not render header when title and icon absent', () => {
		expect( fixture.nativeElement.querySelector( '.multi-stat-header' ) ).toBeFalsy();
	} );

	it( 'should render header title and icon when provided', () => {
		host.settings.set( {
			title: 'Bestellungen',
			icon: 'shopping_cart',
			iconColor: 'primary',
			items: [ { value: 1, label: 'A' } ]
		} );
		fixture.detectChanges();

		const header = fixture.nativeElement.querySelector( '.multi-stat-header' );
		expect( header ).toBeTruthy();
		expect( header.querySelector( '.multi-stat-title' ).textContent.trim() ).toBe( 'Bestellungen' );

		const icon = header.querySelector( 'mat-icon' );
		expect( icon.textContent.trim() ).toBe( 'shopping_cart' );
		expect( icon.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should render prefix and suffix per item', () => {
		host.settings.set( { items: [ { value: 100, label: 'Umsatz', prefix: '€', suffix: ' Mio' } ] } );
		fixture.detectChanges();

		expect( fixture.nativeElement.querySelector( '.prefix' ).textContent.trim() ).toBe( '€' );
		expect( fixture.nativeElement.querySelector( '.suffix' ).textContent.trim() ).toBe( 'Mio' );
	} );

	it( 'should render trend with correct icon per direction', () => {
		host.settings.set( {
			items: [
				{ value: 1, label: 'Up', trend: { value: 12, direction: 'up' } },
				{ value: 2, label: 'Down', trend: { value: -5, direction: 'down' } },
				{ value: 3, label: 'Flat', trend: { value: 0, direction: 'neutral' } }
			]
		} );
		fixture.detectChanges();

		const trends = fixture.nativeElement.querySelectorAll( '.stat-trend' );
		expect( trends.length ).toBe( 3 );
		expect( trends[ 0 ].classList.contains( 'up' ) ).toBe( true );
		expect( trends[ 0 ].querySelector( 'mat-icon' ).textContent.trim() ).toBe( 'trending_up' );
		expect( trends[ 0 ].textContent ).toContain( '+12%' );
		expect( trends[ 1 ].querySelector( 'mat-icon' ).textContent.trim() ).toBe( 'trending_down' );
		expect( trends[ 2 ].querySelector( 'mat-icon' ).textContent.trim() ).toBe( 'trending_flat' );
	} );

	it( 'should render trend as sibling of stat-data (beside, not inside the value column)', () => {
		host.settings.set( { items: [ { value: 1, label: 'A', trend: { value: 3, direction: 'up' } } ] } );
		fixture.detectChanges();

		// Trend darf NICHT in der Wert/Label-Spalte liegen, sondern daneben.
		expect( fixture.nativeElement.querySelector( '.stat-data .stat-trend' ) ).toBeFalsy();
		expect( fixture.nativeElement.querySelector( '.multi-stat-item .stat-trend' ) ).toBeTruthy();
	} );

	it( 'should arrange items horizontally by default', () => {
		const container = fixture.nativeElement.querySelector( '.multi-stat-items' );
		expect( container.classList.contains( 'vertical' ) ).toBe( false );
	} );

	it( 'should add vertical class when verticalItems set', () => {
		host.settings.set( { verticalItems: true, items: [ { value: 1, label: 'A' } ] } );
		fixture.detectChanges();

		const container = fixture.nativeElement.querySelector( '.multi-stat-items' );
		expect( container.classList.contains( 'vertical' ) ).toBe( true );
	} );

	it( 'should not wrap item in a link when no link provided', () => {
		expect( fixture.nativeElement.querySelector( '.multi-stat-link' ) ).toBeFalsy();
	} );

	it( 'should render item as router link with query params when link provided', () => {
		host.settings.set( { items: [ { value: 12, label: 'Offen', link: '/Stats?status=open' } ] } );
		fixture.detectChanges();

		const link = fixture.nativeElement.querySelector( 'a.multi-stat-link' );
		expect( link ).toBeTruthy();
		// routerLink + queryParams → aufgelöster href inkl. Query.
		expect( link.getAttribute( 'href' ) ).toBe( '/Stats?status=open' );
		expect( link.querySelector( '.stat-value' ).textContent ).toContain( '12' );
	} );

	it( 'should show reload button when reload and url set', () => {
		host.settings.set( { title: 'Live', url: '/api/live', reload: true, items: [ { value: 1, label: 'A' } ] } );
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector( '.reload-btn' );
		expect( btn ).toBeTruthy();
		expect( btn.querySelector( 'mat-icon' ).textContent.trim() ).toBe( 'autorenew' );
	} );

	it( 'should load items from url (AJAX) and render them', async () => {
		postFn = () => of( { data: { items: [
			{ value: 7, label: 'Geladen', color: 'blue' },
			{ value: 9, label: 'Auch', color: 'green' }
		] } } );
		host.settings.set( { title: 'Live', url: '/api/live', reload: true } );
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		const items = fixture.nativeElement.querySelectorAll( '.multi-stat-item' );
		expect( items.length ).toBe( 2 );
		expect( items[ 0 ].querySelector( '.stat-value' ).textContent ).toContain( '7' );
		expect( items[ 1 ].querySelector( '.stat-label' ).textContent.trim() ).toBe( 'Auch' );
	} );
} );
