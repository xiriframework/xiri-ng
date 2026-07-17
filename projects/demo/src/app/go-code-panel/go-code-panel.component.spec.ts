import { describe, it, expect } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GoCodePanelComponent } from './go-code-panel.component';

describe( 'GoCodePanelComponent', () => {
	let fixture: ComponentFixture<GoCodePanelComponent>;

	function createComponent( code: string, expanded?: boolean ) {
		TestBed.configureTestingModule( {
			imports: [ GoCodePanelComponent ],
		} );

		fixture = TestBed.createComponent( GoCodePanelComponent );
		fixture.componentRef.setInput( 'code', code );
		if ( expanded !== undefined ) {
			fixture.componentRef.setInput( 'expanded', expanded );
		}
		fixture.detectChanges();
	}

	function details(): HTMLDetailsElement {
		return fixture.nativeElement.querySelector( 'details' ) as HTMLDetailsElement;
	}

	function summary(): HTMLElement {
		return fixture.nativeElement.querySelector( 'summary' ) as HTMLElement;
	}

	it( 'should create', () => {
		createComponent( 'package main' );
		expect( fixture.componentInstance ).toBeTruthy();
	} );

	it( 'should render title and code', () => {
		createComponent( 'func main() {}' );
		fixture.componentRef.setInput( 'title', 'Go Backend' );
		fixture.detectChanges();

		expect( summary().textContent ).toContain( 'Go Backend' );
		expect( fixture.nativeElement.querySelector( '.go-code-body' ).textContent ).toContain( 'func main() {}' );
	} );

	it( 'should be collapsed by default (body hidden)', () => {
		createComponent( 'package main' );

		expect( details().open ).toBe( false );
	} );

	it( 'should expand when the summary is toggled', () => {
		createComponent( 'package main' );
		expect( details().open ).toBe( false );

		summary().click();
		fixture.detectChanges();

		expect( details().open ).toBe( true );
	} );

	it( 'should start expanded when expanded input is true', () => {
		createComponent( 'package main', true );

		expect( details().open ).toBe( true );
	} );
} );
