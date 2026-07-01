import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriSkeletonComponent, XiriSkeletonType } from './skeleton.component';

@Component( {
	template: `<xiri-skeleton [type]="type()" [width]="width()" [height]="height()" [lines]="lines()" [columns]="columns()" [animate]="animate()" [fill]="fill()"/>`,
	imports: [ XiriSkeletonComponent ]
} )
class TestHostComponent {
	type = signal<XiriSkeletonType>( 'text' );
	width = signal( '100%' );
	height = signal( '1em' );
	lines = signal( 1 );
	columns = signal( 4 );
	animate = signal( true );
	fill = signal( false );
}

describe( 'XiriSkeletonComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-skeleton' );
		expect( el ).toBeTruthy();
	} );

	it( 'should have role="status" and aria-label on the host', () => {
		const el = fixture.nativeElement.querySelector( 'xiri-skeleton' );
		expect( el.getAttribute( 'role' ) ).toBe( 'status' );
		expect( el.getAttribute( 'aria-label' ) ).toBe( 'Laden...' );
	} );

	describe( 'text type', () => {
		it( 'should render skeleton-text with default 1 line', () => {
			const textBlock = fixture.nativeElement.querySelector( '.skeleton-text' );
			expect( textBlock ).toBeTruthy();

			const lines = textBlock.querySelectorAll( '.skeleton-line' );
			expect( lines.length ).toBe( 1 );
		} );

		it( 'should render multiple lines', () => {
			host.lines.set( 3 );
			fixture.detectChanges();

			const lines = fixture.nativeElement.querySelectorAll( '.skeleton-line' );
			expect( lines.length ).toBe( 3 );
		} );

		it( 'should apply animate class when animate is true', () => {
			const line = fixture.nativeElement.querySelector( '.skeleton-line' );
			expect( line.classList.contains( 'animate' ) ).toBe( true );
		} );

		it( 'should not apply animate class when animate is false', () => {
			host.animate.set( false );
			fixture.detectChanges();

			const line = fixture.nativeElement.querySelector( '.skeleton-line' );
			expect( line.classList.contains( 'animate' ) ).toBe( false );
		} );

		it( 'should apply custom height to lines', () => {
			host.height.set( '2em' );
			fixture.detectChanges();

			const line: HTMLElement = fixture.nativeElement.querySelector( '.skeleton-line' );
			expect( line.style.height ).toBe( '2em' );
		} );
	} );

	describe( 'circle type', () => {
		beforeEach( () => {
			host.type.set( 'circle' );
			fixture.detectChanges();
		} );

		it( 'should render skeleton-circle', () => {
			const circle = fixture.nativeElement.querySelector( '.skeleton-circle' );
			expect( circle ).toBeTruthy();
		} );

		it( 'should use width for both dimensions', () => {
			host.width.set( '50px' );
			fixture.detectChanges();

			const circle: HTMLElement = fixture.nativeElement.querySelector( '.skeleton-circle' );
			expect( circle.style.width ).toBe( '50px' );
			expect( circle.style.height ).toBe( '50px' );
		} );
	} );

	describe( 'rect type', () => {
		beforeEach( () => {
			host.type.set( 'rect' );
			fixture.detectChanges();
		} );

		it( 'should render skeleton-rect', () => {
			const rect = fixture.nativeElement.querySelector( '.skeleton-rect' );
			expect( rect ).toBeTruthy();
		} );

		it( 'should apply width and height', () => {
			host.width.set( '200px' );
			host.height.set( '100px' );
			fixture.detectChanges();

			const rect: HTMLElement = fixture.nativeElement.querySelector( '.skeleton-rect' );
			expect( rect.style.width ).toBe( '200px' );
			expect( rect.style.height ).toBe( '100px' );
		} );
	} );

	describe( 'table-row type', () => {
		beforeEach( () => {
			host.type.set( 'table-row' );
			host.lines.set( 2 );
			host.columns.set( 3 );
			fixture.detectChanges();
		} );

		it( 'should render skeleton-table', () => {
			const table = fixture.nativeElement.querySelector( '.skeleton-table' );
			expect( table ).toBeTruthy();
		} );

		it( 'should render correct number of rows', () => {
			const rows = fixture.nativeElement.querySelectorAll( '.skeleton-table-row' );
			expect( rows.length ).toBe( 2 );
		} );

		it( 'should render correct number of cells per row', () => {
			const firstRow = fixture.nativeElement.querySelector( '.skeleton-table-row' );
			const cells = firstRow.querySelectorAll( '.skeleton-table-cell' );
			expect( cells.length ).toBe( 3 );
		} );

		it( 'should apply fill-height class when fill is true', () => {
			host.fill.set( true );
			fixture.detectChanges();

			const table = fixture.nativeElement.querySelector( '.skeleton-table' );
			expect( table.classList.contains( 'fill-height' ) ).toBe( true );
		} );
	} );

	describe( 'computed properties', () => {
		it( 'should compute linesArray with correct length', () => {
			const component = fixture.debugElement.children[0].componentInstance as XiriSkeletonComponent;
			host.lines.set( 5 );
			fixture.detectChanges();

			expect( component.linesArray().length ).toBe( 5 );
		} );

		it( 'should compute columnsArray with correct length', () => {
			const component = fixture.debugElement.children[0].componentInstance as XiriSkeletonComponent;
			host.columns.set( 6 );
			fixture.detectChanges();

			expect( component.columnsArray().length ).toBe( 6 );
		} );
	} );

	describe( 'fill host class binding', () => {
		it( 'should not have fill class by default', () => {
			const el = fixture.nativeElement.querySelector( 'xiri-skeleton' );
			expect( el.classList.contains( 'fill' ) ).toBe( false );
		} );

		it( 'should have fill class when fill is true', () => {
			host.fill.set( true );
			fixture.detectChanges();

			const el = fixture.nativeElement.querySelector( 'xiri-skeleton' );
			expect( el.classList.contains( 'fill' ) ).toBe( true );
		} );
	} );
} );
