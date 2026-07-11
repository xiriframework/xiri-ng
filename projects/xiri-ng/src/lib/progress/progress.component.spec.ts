import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriProgressComponent, XiriProgressSettings } from './progress.component';

@Component( {
	template: `<xiri-progress [settings]="settings()"/>`,
	imports: [ XiriProgressComponent ]
} )
class TestHostComponent {
	settings = signal<XiriProgressSettings>( { label: 'Symbole', current: 3, total: 10, value: 30 } );
}

describe( 'XiriProgressComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach( async () => {
		await TestBed.configureTestingModule( { imports: [ TestHostComponent ] } ).compileComponents();
		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should render label and the x / y count', () => {
		expect( fixture.nativeElement.querySelector( '.progress-label' ).textContent ).toContain( 'Symbole' );
		expect( fixture.nativeElement.querySelector( '.progress-count' ).textContent.replace( /\s/g, '' ) ).toBe( '3/10' );
	} );

	it( 'should set the progress bar value', () => {
		const bar = fixture.nativeElement.querySelector( 'mat-progress-bar' );
		expect( bar.getAttribute( 'aria-valuenow' ) ).toBe( '30' );
	} );

	it( 'should hide the count in indeterminate mode', () => {
		host.settings.set( { label: 'Läuft', current: 0, total: 0, value: 0, indeterminate: true } );
		fixture.detectChanges();

		expect( fixture.nativeElement.querySelector( '.progress-count' ) ).toBeFalsy();
	} );
} );
