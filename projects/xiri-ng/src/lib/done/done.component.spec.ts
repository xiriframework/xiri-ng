import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { XiriDoneComponent } from './done.component';

describe( 'XiriDoneComponent', () => {
	let fixture: ComponentFixture<XiriDoneComponent>;
	let component: XiriDoneComponent;

	beforeEach( async () => {
		await TestBed.configureTestingModule( {
			imports: [ XiriDoneComponent ]
		} ).compileComponents();

		fixture = TestBed.createComponent( XiriDoneComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );

	it( 'should render a mat-icon with "done" text', () => {
		const icon = fixture.nativeElement.querySelector( 'mat-icon' );
		expect( icon ).toBeTruthy();
		expect( icon.textContent.trim() ).toBe( 'done' );
	} );

	it( 'should have aria-label for accessibility', () => {
		const icon = fixture.nativeElement.querySelector( 'mat-icon' );
		expect( icon.getAttribute( 'aria-label' ) ).toBe( 'Erfolgreich abgeschlossen' );
	} );

	it( 'should have role="status" for accessibility', () => {
		const icon = fixture.nativeElement.querySelector( 'mat-icon' );
		expect( icon.getAttribute( 'role' ) ).toBe( 'status' );
	} );
} );
