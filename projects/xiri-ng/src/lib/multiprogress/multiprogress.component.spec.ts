import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriMultiprogressComponent, XiriMultiprogressSettings } from './multiprogress.component';

@Component( {
	template: `<xiri-multiprogress [settings]="settings()"/>`,
	imports: [ XiriMultiprogressComponent ]
} )
class TestHostComponent {
	settings = signal<XiriMultiprogressSettings>( {
		data: [
			{ text: 'Chrome', value: '65%', progress: 65, color: 'primary' },
			{ text: 'Firefox', value: '20%', progress: 20, color: 'accent' },
			{ text: 'Safari', value: '10%', progress: 10 },
			{ text: 'Edge', value: '3%', progress: 3 },
			{ text: 'Other', value: '2%', progress: 2 }
		],
		header: 'Browser Usage',
		headerIcon: 'bar_chart',
		headerIconColor: 'primary',
		show: 3
	} );
}

describe( 'XiriMultiprogressComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-multiprogress' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render inside a mat-card', () => {
		const card = fixture.nativeElement.querySelector( 'mat-card' );
		expect( card ).toBeTruthy();
	} );

	it( 'should render header text', () => {
		const title = fixture.nativeElement.querySelector( '.title' );
		expect( title ).toBeTruthy();
		expect( title.textContent.trim() ).toBe( 'Browser Usage' );
	} );

	it( 'should render header icon when provided', () => {
		const icon = fixture.nativeElement.querySelector( '.header-image mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'bar_chart' );
	} );

	it( 'should apply headerIconColor', () => {
		const icon = fixture.nativeElement.querySelector( '.header-image mat-icon' );
		expect( icon.classList.contains( 'primary' ) ).toBe( true );
	} );

	it( 'should only show limited items when show is set', () => {
		const items = fixture.nativeElement.querySelectorAll( '.item' );
		expect( items.length ).toBe( 3 );
	} );

	it( 'should render expand button when data exceeds show count', () => {
		const button = fixture.nativeElement.querySelector( '.open button' );
		expect( button ).toBeTruthy();
	} );

	it( 'should have aria-label on expand button', () => {
		const button = fixture.nativeElement.querySelector( '.open button' );
		expect( button.getAttribute( 'aria-label' ) ).toBe( 'Mehr anzeigen' );
	} );

	it( 'should show expand_more icon when collapsed', () => {
		const expandIcon = fixture.nativeElement.querySelector( '.open mat-icon' );
		expect( expandIcon.textContent.trim() ).toBe( 'expand_more' );
	} );

	describe( 'toggle behavior', () => {
		it( 'should start collapsed (isOpen = false)', () => {
			const component = fixture.debugElement.children[0].componentInstance as XiriMultiprogressComponent;
			expect( component.isOpen() ).toBe( false );
		} );

		it( 'should expand when button is clicked', () => {
			const button: HTMLButtonElement = fixture.nativeElement.querySelector( '.open button' );
			button.click();
			fixture.detectChanges();

			const component = fixture.debugElement.children[0].componentInstance as XiriMultiprogressComponent;
			expect( component.isOpen() ).toBe( true );
		} );

		it( 'should show all items when expanded', () => {
			const button: HTMLButtonElement = fixture.nativeElement.querySelector( '.open button' );
			button.click();
			fixture.detectChanges();

			const items = fixture.nativeElement.querySelectorAll( '.item' );
			expect( items.length ).toBe( 5 );
		} );

		it( 'should show expand_less icon when expanded', () => {
			const button: HTMLButtonElement = fixture.nativeElement.querySelector( '.open button' );
			button.click();
			fixture.detectChanges();

			const icon = fixture.nativeElement.querySelector( '.open mat-icon' );
			expect( icon.textContent.trim() ).toBe( 'expand_less' );
		} );

		it( 'should update aria-label when expanded', () => {
			const button: HTMLButtonElement = fixture.nativeElement.querySelector( '.open button' );
			button.click();
			fixture.detectChanges();

			expect( button.getAttribute( 'aria-label' ) ).toBe( 'Weniger anzeigen' );
		} );

		it( 'should collapse when button is clicked again', () => {
			const button: HTMLButtonElement = fixture.nativeElement.querySelector( '.open button' );
			button.click();
			fixture.detectChanges();

			button.click();
			fixture.detectChanges();

			const component = fixture.debugElement.children[0].componentInstance as XiriMultiprogressComponent;
			expect( component.isOpen() ).toBe( false );

			const items = fixture.nativeElement.querySelectorAll( '.item' );
			expect( items.length ).toBe( 3 );
		} );
	} );

	it( 'should not render expand button when show is not set', () => {
		host.settings.set( {
			data: [
				{ text: 'A', value: '50%', progress: 50 },
				{ text: 'B', value: '50%', progress: 50 }
			],
			header: 'Test'
		} );
		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector( '.open button' );
		expect( button ).toBeFalsy();
	} );

	it( 'should not render expand button when data length is within show limit', () => {
		host.settings.set( {
			data: [
				{ text: 'A', value: '100%', progress: 100 }
			],
			header: 'Test',
			show: 3
		} );
		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector( '.open button' );
		expect( button ).toBeFalsy();
	} );

	it( 'should show all items when show is not set', () => {
		host.settings.set( {
			data: [
				{ text: 'A', value: '50%', progress: 50 },
				{ text: 'B', value: '30%', progress: 30 },
				{ text: 'C', value: '20%', progress: 20 }
			],
			header: 'All Visible'
		} );
		fixture.detectChanges();

		const items = fixture.nativeElement.querySelectorAll( '.item' );
		expect( items.length ).toBe( 3 );
	} );

	it( 'should render item text and value', () => {
		const firstItem = fixture.nativeElement.querySelector( '.item' );
		const text = firstItem.querySelector( '.text' );
		const value = firstItem.querySelector( '.value' );
		expect( text.textContent.trim() ).toBe( 'Chrome' );
		expect( value.textContent.trim() ).toBe( '65%' );
	} );

	it( 'should render progress bars', () => {
		const bars = fixture.nativeElement.querySelectorAll( 'mat-progress-bar' );
		expect( bars.length ).toBe( 3 );
	} );

	it( 'should handle empty data array', () => {
		host.settings.set( { data: [], header: 'Empty' } );
		fixture.detectChanges();

		const items = fixture.nativeElement.querySelectorAll( '.item' );
		expect( items.length ).toBe( 0 );
	} );

	it( 'should not render header icon when not provided', () => {
		host.settings.set( { data: [], header: 'No Icon' } );
		fixture.detectChanges();

		const avatar = fixture.nativeElement.querySelector( '.header-image' );
		expect( avatar ).toBeFalsy();
	} );

	it( 'should default headerIconColor to primary', () => {
		host.settings.set( {
			data: [],
			header: 'Test',
			headerIcon: 'chart'
		} );
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector( '.header-image mat-icon' );
		expect( icon.classList.contains( 'primary' ) ).toBe( true );
	} );
} );
