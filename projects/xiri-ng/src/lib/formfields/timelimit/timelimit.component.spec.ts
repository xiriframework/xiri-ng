import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { XiriTimelimitComponent } from './timelimit.component';

@Component( {
	            selector: 'xiri-timelimit-host',
	            template:
		            `<form [formGroup]="form">
			            <mat-form-field>
				            <xiri-timelimit formControlName="t"></xiri-timelimit>
			            </mat-form-field>
		            </form>`,
	            imports: [ XiriTimelimitComponent, MatFormFieldModule, ReactiveFormsModule ],
            } )
class HostComponent {
	form = new FormGroup( { t: new FormControl<unknown>( null ) } );
}

describe( 'XiriTimelimitComponent', () => {

	function setup() {
		TestBed.configureTestingModule( { imports: [ HostComponent ] } );
		const fixture = TestBed.createComponent( HostComponent );
		fixture.detectChanges();
		const selects = fixture.debugElement.queryAll( By.directive( MatSelect ) ).map( d => d.componentInstance as MatSelect );
		return { fixture, host: fixture.componentInstance, selects };
	}

	it( 'minute options carry the minute value in ascending order', () => {
		const { selects } = setup();
		for ( const idx of [ 1, 3 ] ) {
			expect( selects[ idx ].options.map( o => o.value ) ).toEqual( [ 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55 ] );
			expect( selects[ idx ].options.map( o => o.viewValue ) )
				.toEqual( [ '00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55' ] );
		}
	} );

	it( 'round-trips minutes from backend strings', () => {
		const { fixture, host, selects } = setup();
		host.form.setValue( { t: { check: true, wd: [ true, false, false, false, false, false, false ],
			fromhour: '08', frommin: '30', tohour: '17', tomin: '45', in: true } } );
		fixture.detectChanges();

		expect( selects[ 1 ].triggerValue ).toBe( '30' );
		expect( selects[ 3 ].triggerValue ).toBe( '45' );
		const v = host.form.value.t as { frommin: number; tomin: number };
		expect( v.frommin ).toBe( 30 );
		expect( v.tomin ).toBe( 45 );
	} );
} );
