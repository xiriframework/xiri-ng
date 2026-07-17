import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { XiriTreeselectComponent } from './treeselect.component';
import { XiriDataService } from '../../services/data.service';
import { XiriSnackbarService } from '../../services/snackbar.service';
import { XiriFormField } from '../field.interface';

@Component( {
	selector: 'xiri-treeselect-test-host',
	template: `<xiri-treeselect [field]="field" [formControl]="ctrl"></xiri-treeselect>`,
	imports: [ XiriTreeselectComponent, ReactiveFormsModule ],
} )
class TestHostComponent {
	field: XiriFormField = {
		id: 'cat', type: 'treeselect', name: 'Kategorie',
		list: [ { id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' } ],
	} as unknown as XiriFormField;
	ctrl = new FormControl<unknown>( [ 'A' ] );
	cmp = viewChild.required( XiriTreeselectComponent );
}

describe( 'XiriTreeselectComponent – writeValue / reset', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [
				{ provide: XiriDataService, useValue: { get: vi.fn() } },
				{ provide: XiriSnackbarService, useValue: { error: vi.fn() } },
			],
		} );
		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'übernimmt den initialen FormControl-Wert in die Baum-Auswahl', () => {
		expect( host.cmp().value ).toEqual( [ 'A' ] );
	} );

	it( 'reset([]) leert die Auswahl und schreibt den alten Wert nicht zurück', () => {
		expect( host.ctrl.value ).toEqual( [ 'A' ] );

		host.ctrl.reset( [] );
		fixture.detectChanges();

		// Regression: früher hat writeValue den alten Stand ('A') über den value-Getter
		// erneut ans Control emittiert, sodass reset() wirkungslos blieb.
		expect( host.cmp().value ).toEqual( [] );
		expect( host.ctrl.value ).toEqual( [] );
	} );

	it( 'setValue(...) auf dem FormControl aktualisiert die sichtbare Auswahl', () => {
		host.ctrl.setValue( [ 'B' ] );
		fixture.detectChanges();

		expect( host.cmp().value ).toEqual( [ 'B' ] );
		expect( host.ctrl.value ).toEqual( [ 'B' ] );
	} );
} );
