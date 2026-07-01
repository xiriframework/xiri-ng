import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriTimelineComponent, XiriTimelineSettings } from './timeline.component';

@Component( {
	template: `<xiri-timeline [settings]="settings()"/>`,
	imports: [ XiriTimelineComponent ]
} )
class TestHostComponent {
	settings = signal<XiriTimelineSettings>( {
		items: [
			{ title: 'Created', description: 'Item was created', datetime: '2024-01-01', icon: 'add', iconColor: 'success' },
			{ title: 'Updated', datetime: '2024-01-15' },
			{ title: 'Completed' }
		]
	} );
}

describe( 'XiriTimelineComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-timeline' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render all timeline items', () => {
		const items = fixture.nativeElement.querySelectorAll( '.timeline-item' );
		expect( items.length ).toBe( 3 );
	} );

	it( 'should render title for each item', () => {
		const titles = fixture.nativeElement.querySelectorAll( '.timeline-title' );
		expect( titles[0].textContent.trim() ).toBe( 'Created' );
		expect( titles[1].textContent.trim() ).toBe( 'Updated' );
		expect( titles[2].textContent.trim() ).toBe( 'Completed' );
	} );

	it( 'should render description when provided', () => {
		const descriptions = fixture.nativeElement.querySelectorAll( '.timeline-description' );
		expect( descriptions.length ).toBe( 1 );
		expect( descriptions[0].textContent.trim() ).toBe( 'Item was created' );
	} );

	it( 'should render datetime when provided', () => {
		const datetimes = fixture.nativeElement.querySelectorAll( '.timeline-datetime' );
		expect( datetimes.length ).toBe( 2 );
		expect( datetimes[0].textContent.trim() ).toBe( '2024-01-01' );
	} );

	it( 'should render icon when provided', () => {
		const firstDot = fixture.nativeElement.querySelector( '.timeline-dot' );
		const icon = firstDot.querySelector( 'mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'add' );
	} );

	it( 'should apply iconColor class to dot', () => {
		const firstDot = fixture.nativeElement.querySelector( '.timeline-dot' );
		expect( firstDot.classList.contains( 'success' ) ).toBe( true );
	} );

	it( 'should default iconColor to primary', () => {
		const dots = fixture.nativeElement.querySelectorAll( '.timeline-dot' );
		expect( dots[1].classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should mark the first and last items with "first"/"last" classes', () => {
		const items = fixture.nativeElement.querySelectorAll( '.timeline-item' );
		expect( items[0].classList.contains( 'first' ) ).toBe( true );
		expect( items[0].classList.contains( 'last' ) ).toBe( false );
		expect( items[1].classList.contains( 'first' ) ).toBe( false );
		expect( items[1].classList.contains( 'last' ) ).toBe( false );
		expect( items[2].classList.contains( 'first' ) ).toBe( false );
		expect( items[2].classList.contains( 'last' ) ).toBe( true );
	} );

	it( 'should render line-before and line-after on every item', () => {
		const items = fixture.nativeElement.querySelectorAll( '.timeline-item' );

		for ( const item of items ) {
			expect( item.querySelector( '.timeline-line.line-before' ) ).toBeTruthy();
			expect( item.querySelector( '.timeline-line.line-after' ) ).toBeTruthy();
		}
	} );

	it( 'should handle empty items array', () => {
		host.settings.set( { items: [] } );
		fixture.detectChanges();

		const items = fixture.nativeElement.querySelectorAll( '.timeline-item' );
		expect( items.length ).toBe( 0 );
	} );

	it( 'should handle single item (marked both first and last)', () => {
		host.settings.set( { items: [ { title: 'Only Item' } ] } );
		fixture.detectChanges();

		const items = fixture.nativeElement.querySelectorAll( '.timeline-item' );
		expect( items.length ).toBe( 1 );
		expect( items[0].classList.contains( 'first' ) ).toBe( true );
		expect( items[0].classList.contains( 'last' ) ).toBe( true );
	} );

	it( 'should update when settings change', () => {
		host.settings.set( {
			items: [ { title: 'New Item', description: 'New Description' } ]
		} );
		fixture.detectChanges();

		const titles = fixture.nativeElement.querySelectorAll( '.timeline-title' );
		expect( titles.length ).toBe( 1 );
		expect( titles[0].textContent.trim() ).toBe( 'New Item' );
	} );

	it( 'should not apply "horizontal" class when orientation is unset', () => {
		const root = fixture.nativeElement.querySelector( '.timeline' );
		expect( root.classList.contains( 'horizontal' ) ).toBe( false );
	} );

	it( 'should apply "horizontal" class when orientation is "horizontal"', () => {
		host.settings.set( {
			orientation: 'horizontal',
			items: [ { title: 'Step 1' }, { title: 'Step 2' } ]
		} );
		fixture.detectChanges();

		const root = fixture.nativeElement.querySelector( '.timeline' );
		expect( root.classList.contains( 'horizontal' ) ).toBe( true );
	} );

	it( 'should not apply "horizontal" class when orientation is "vertical"', () => {
		host.settings.set( {
			orientation: 'vertical',
			items: [ { title: 'Step 1' } ]
		} );
		fixture.detectChanges();

		const root = fixture.nativeElement.querySelector( '.timeline' );
		expect( root.classList.contains( 'horizontal' ) ).toBe( false );
	} );

	it( 'should hide description when orientation is "horizontal"', () => {
		host.settings.set( {
			orientation: 'horizontal',
			items: [ { title: 'Step 1', description: 'Hidden in horizontal' } ]
		} );
		fixture.detectChanges();

		const descriptions = fixture.nativeElement.querySelectorAll( '.timeline-description' );
		expect( descriptions.length ).toBe( 0 );
	} );
} );
