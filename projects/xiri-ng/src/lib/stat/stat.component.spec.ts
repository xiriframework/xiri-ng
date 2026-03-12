import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriStatComponent, XiriStatSettings } from './stat.component';

@Component( {
	template: `<xiri-stat [settings]="settings()"/>`,
	imports: [ XiriStatComponent ]
} )
class TestHostComponent {
	settings = signal<XiriStatSettings>( { value: '1,234', label: 'Total Users' } );
}

describe( 'XiriStatComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-stat' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render value and label', () => {
		const value = fixture.nativeElement.querySelector( '.stat-value' );
		expect( value.textContent ).toContain( '1,234' );

		const label = fixture.nativeElement.querySelector( '.stat-label' );
		expect( label.textContent.trim() ).toBe( 'Total Users' );
	} );

	it( 'should render numeric value', () => {
		host.settings.set( { value: 42, label: 'Count' } );
		fixture.detectChanges();

		const value = fixture.nativeElement.querySelector( '.stat-value' );
		expect( value.textContent ).toContain( '42' );
	} );

	it( 'should not render icon when not provided', () => {
		const iconContainer = fixture.nativeElement.querySelector( '.stat-icon' );
		expect( iconContainer ).toBeFalsy();
	} );

	it( 'should render icon when provided', () => {
		host.settings.set( { value: '10', label: 'Items', icon: 'inventory', iconColor: 'primary' } );
		fixture.detectChanges();

		const iconContainer = fixture.nativeElement.querySelector( '.stat-icon' );
		expect( iconContainer ).toBeTruthy();

		const icon = iconContainer.querySelector( 'mat-icon' );
		expect( icon.textContent.trim() ).toBe( 'inventory' );
		expect( icon.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should default iconColor to primary when not specified', () => {
		host.settings.set( { value: '10', label: 'Items', icon: 'inventory' } );
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector( '.stat-icon mat-icon' );
		expect( icon.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should render prefix when provided', () => {
		host.settings.set( { value: '100', label: 'Revenue', prefix: '$' } );
		fixture.detectChanges();

		const prefix = fixture.nativeElement.querySelector( '.prefix' );
		expect( prefix ).toBeTruthy();
		expect( prefix.textContent.trim() ).toBe( '$' );
	} );

	it( 'should render suffix when provided', () => {
		host.settings.set( { value: '75', label: 'Progress', suffix: '%' } );
		fixture.detectChanges();

		const suffix = fixture.nativeElement.querySelector( '.suffix' );
		expect( suffix ).toBeTruthy();
		expect( suffix.textContent.trim() ).toBe( '%' );
	} );

	it( 'should not render prefix/suffix when not provided', () => {
		expect( fixture.nativeElement.querySelector( '.prefix' ) ).toBeFalsy();
		expect( fixture.nativeElement.querySelector( '.suffix' ) ).toBeFalsy();
	} );

	it( 'should not render trend when not provided', () => {
		const trend = fixture.nativeElement.querySelector( '.stat-trend' );
		expect( trend ).toBeFalsy();
	} );

	it( 'should render upward trend', () => {
		host.settings.set( {
			value: '500',
			label: 'Sales',
			trend: { value: 12, direction: 'up' }
		} );
		fixture.detectChanges();

		const trend = fixture.nativeElement.querySelector( '.stat-trend' );
		expect( trend ).toBeTruthy();
		expect( trend.classList.contains( 'up' ) ).toBe( true );
		expect( trend.textContent ).toContain( '+12%' );

		const icon = trend.querySelector( 'mat-icon' );
		expect( icon.textContent.trim() ).toBe( 'trending_up' );
	} );

	it( 'should render downward trend', () => {
		host.settings.set( {
			value: '300',
			label: 'Visits',
			trend: { value: -5, direction: 'down' }
		} );
		fixture.detectChanges();

		const trend = fixture.nativeElement.querySelector( '.stat-trend' );
		expect( trend.classList.contains( 'down' ) ).toBe( true );
		expect( trend.textContent ).toContain( '-5%' );

		const icon = trend.querySelector( 'mat-icon' );
		expect( icon.textContent.trim() ).toBe( 'trending_down' );
	} );

	it( 'should render neutral trend', () => {
		host.settings.set( {
			value: '100',
			label: 'Stable',
			trend: { value: 0, direction: 'neutral' }
		} );
		fixture.detectChanges();

		const trend = fixture.nativeElement.querySelector( '.stat-trend' );
		expect( trend.classList.contains( 'neutral' ) ).toBe( true );

		const icon = trend.querySelector( 'mat-icon' );
		expect( icon.textContent.trim() ).toBe( 'trending_flat' );
	} );

	it( 'should apply color class to stat-value', () => {
		host.settings.set( { value: '42', label: 'Test', color: 'success' } );
		fixture.detectChanges();

		const value = fixture.nativeElement.querySelector( '.stat-value' );
		expect( value.classList.contains( 'success' ) ).toBe( true );
	} );

	it( 'should handle empty string value', () => {
		host.settings.set( { value: '', label: 'Empty' } );
		fixture.detectChanges();

		const label = fixture.nativeElement.querySelector( '.stat-label' );
		expect( label.textContent.trim() ).toBe( 'Empty' );
	} );
} );
