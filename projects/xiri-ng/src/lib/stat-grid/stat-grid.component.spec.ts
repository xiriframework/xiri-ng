import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriStatGridComponent, XiriStatGridSettings } from './stat-grid.component';

@Component( {
	template: `<xiri-stat-grid [settings]="settings()"/>`,
	imports: [ XiriStatGridComponent ]
} )
class TestHostComponent {
	settings = signal<XiriStatGridSettings>( {
		stats: [
			{ value: '100', label: 'Users' },
			{ value: '50', label: 'Orders' },
			{ value: '75%', label: 'Rate' }
		]
	} );
}

describe( 'XiriStatGridComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-stat-grid' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render all stat components', () => {
		const stats = fixture.nativeElement.querySelectorAll( 'xiri-stat' );
		expect( stats.length ).toBe( 3 );
	} );

	it( 'should not render title when not provided', () => {
		const title = fixture.nativeElement.querySelector( '.stat-grid-title' );
		expect( title ).toBeFalsy();
	} );

	it( 'should render title when provided', () => {
		host.settings.set( { ...host.settings(), title: 'Dashboard Stats' } );
		fixture.detectChanges();

		const title = fixture.nativeElement.querySelector( '.stat-grid-title' );
		expect( title ).toBeTruthy();
		expect( title.textContent.trim() ).toBe( 'Dashboard Stats' );
	} );

	it( 'should default columns to 4 via CSS variable', () => {
		const grid: HTMLElement = fixture.nativeElement.querySelector( '.stat-grid' );
		expect( grid.style.getPropertyValue( '--stat-cols' ) ).toBe( '4' );
	} );

	it( 'should apply custom columns count', () => {
		host.settings.set( { stats: host.settings().stats, columns: 3 } );
		fixture.detectChanges();

		const grid: HTMLElement = fixture.nativeElement.querySelector( '.stat-grid' );
		expect( grid.style.getPropertyValue( '--stat-cols' ) ).toBe( '3' );
	} );

	it( 'should handle empty stats array', () => {
		host.settings.set( { stats: [] } );
		fixture.detectChanges();

		const stats = fixture.nativeElement.querySelectorAll( 'xiri-stat' );
		expect( stats.length ).toBe( 0 );
	} );

	it( 'should update when stats change', () => {
		host.settings.set( {
			stats: [
				{ value: '1', label: 'One' },
				{ value: '2', label: 'Two' }
			]
		} );
		fixture.detectChanges();

		const stats = fixture.nativeElement.querySelectorAll( 'xiri-stat' );
		expect( stats.length ).toBe( 2 );
	} );
} );
