import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriChipsComponent } from './chips.component';
import { XiriFormField } from '../field.interface';

@Component( {
	            selector: 'xiri-chips-test-host',
	            template: `<xiri-chips [field]="field()" />`,
	            imports: [ XiriChipsComponent ],
            } )
class TestHostComponent {
	field = signal<XiriFormField>( { id: 'tags', type: 'chips', name: 'Tags' } as XiriFormField );
}

describe( 'XiriChipsComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let component: XiriChipsComponent;

	beforeEach( async () => {
		await TestBed.configureTestingModule( { imports: [ TestHostComponent ] } ).compileComponents();

		fixture = TestBed.createComponent( TestHostComponent );
		fixture.detectChanges();
		component = fixture.debugElement.children[ 0 ].componentInstance as XiriChipsComponent;
	} );

	it( 'should be created', () => {
		expect( component ).toBeTruthy();
	} );

	// matChipRemove sets no accessible name of its own, and mat-icon carries
	// aria-hidden="true" by default — without a label the button is nameless.
	it( 'names the remove button per chip', () => {
		component.writeValue( [ 'alpha', 'beta' ] );
		fixture.detectChanges();

		const labels = [ ...fixture.nativeElement.querySelectorAll( 'button[matChipRemove]' ) ]
				.map( ( b: Element ) => b.getAttribute( 'aria-label' ) );

		expect( labels.length ).toBe( 2 );
		expect( labels[ 0 ] ).toContain( 'alpha' );
		expect( labels[ 1 ] ).toContain( 'beta' );
	} );
} );
