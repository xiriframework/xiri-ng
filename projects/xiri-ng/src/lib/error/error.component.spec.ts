import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriErrorComponent } from './error.component';

@Component( {
	template: `<xiri-error [text]="text()"/>`,
	imports: [ XiriErrorComponent ]
} )
class TestHostComponent {
	text = signal( 'Something went wrong' );
}

describe( 'XiriErrorComponent', () => {
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
		const el = fixture.nativeElement.querySelector( 'xiri-error' );
		expect( el ).toBeTruthy();
	} );

	it( 'should render the error text', () => {
		const errorDiv: HTMLElement = fixture.nativeElement.querySelector( '.error' );
		expect( errorDiv.textContent.trim() ).toBe( 'Something went wrong' );
	} );

	it( 'should update when text input changes', () => {
		host.text.set( 'New error message' );
		fixture.detectChanges();

		const errorDiv: HTMLElement = fixture.nativeElement.querySelector( '.error' );
		expect( errorDiv.textContent.trim() ).toBe( 'New error message' );
	} );

	it( 'should handle empty string', () => {
		host.text.set( '' );
		fixture.detectChanges();

		const errorDiv: HTMLElement = fixture.nativeElement.querySelector( '.error' );
		expect( errorDiv.textContent.trim() ).toBe( '' );
	} );

	it( 'should handle long text', () => {
		const longText = 'A'.repeat( 500 );
		host.text.set( longText );
		fixture.detectChanges();

		const errorDiv: HTMLElement = fixture.nativeElement.querySelector( '.error' );
		expect( errorDiv.textContent.trim() ).toBe( longText );
	} );

	it( 'should have the error CSS class', () => {
		const errorDiv = fixture.nativeElement.querySelector( '.error' );
		expect( errorDiv ).toBeTruthy();
	} );
} );
