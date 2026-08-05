import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { XiriTreeselectComponent } from './treeselect.component';
import { XiriDataService } from '../../services/data.service';
import { XiriSnackbarService } from '../../services/snackbar.service';
import { XiriFormField } from '../field.interface';

@Component( {
	selector: 'xiri-treeselect-test-host',
	template: `<xiri-treeselect [field]="field()" [formControl]="ctrl"></xiri-treeselect>`,
	imports: [ XiriTreeselectComponent, ReactiveFormsModule ],
} )
class TestHostComponent {
	field = signal<XiriFormField>( {
		id: 'cat', type: 'treeselect', name: 'Kategorie',
		list: [ { id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' } ],
	} as unknown as XiriFormField );
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

// Ein Options-Reload ersetzt das gebundene Feld-Objekt, wodurch der field-Setter erneut läuft
// und den Baum neu aufbaut. Die Auswahl muss dabei sauber neu gespiegelt werden — sonst bleiben
// die alten Node-Objekte im SelectionModel selektiert (doppelte IDs) und das Zurückschreiben
// emittiert nebenbei ans FormControl.
describe( 'XiriTreeselectComponent – Neuaufbau bei neuer Feld-Identität', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach( () => {
		TestBed.resetTestingModule();
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

	function replaceList( list: { id: string, name: string }[] ) {
		host.field.set( { ...host.field(), list } as unknown as XiriFormField );
		fixture.detectChanges();
	}

	it( 'behält eine weiterhin gültige Auswahl genau einmal', () => {
		expect( host.cmp().value ).toEqual( [ 'A' ] );

		replaceList( [ { id: 'A', name: 'A' }, { id: 'B', name: 'B' } ] );

		expect( host.cmp().field.list?.map( x => x.id ) ).toEqual( [ 'A', 'B' ] );
		expect( host.cmp().value ).toEqual( [ 'A' ] );
	} );

	it( 'schreibt beim Neuaufbau nicht ans FormControl zurück', () => {
		const emitted: unknown[] = [];
		host.ctrl.valueChanges.subscribe( v => emitted.push( v ) );

		replaceList( [ { id: 'A', name: 'A' }, { id: 'B', name: 'B' } ] );

		expect( emitted ).toEqual( [] );
		expect( host.ctrl.value ).toEqual( [ 'A' ] );
	} );

	it( 'verliert eine Auswahl, die es in der neuen Liste nicht mehr gibt', () => {
		replaceList( [ { id: 'B', name: 'B' }, { id: 'C', name: 'C' } ] );

		expect( host.cmp().value ).toEqual( [] );
	} );
} );

// Die Typen waren auf number[] verengt, die Werte selbst wurden aber nie konvertiert.
// Dieser Block nagelt den CVA-Vertrag fest: IDs kommen unverändert zurück, damit eine
// spätere Number()/+-Coercion sofort auffällt (die würde IDs über 2^53 runden).
describe( 'XiriTreeselectComponent – ID-Typen', () => {
	function hostWith( ids: ( string | number )[], selected: ( string | number )[] ) {
		@Component( {
			selector: 'xiri-treeselect-id-host',
			template: `<xiri-treeselect [field]="field" [formControl]="ctrl"></xiri-treeselect>`,
			imports: [ XiriTreeselectComponent, ReactiveFormsModule ],
		} )
		class Host {
			field = {
				id: 'cat', type: 'treeselect', name: 'Kategorie',
				list: ids.map( id => ( { id, name: `N${ id }` } ) ),
			} as unknown as XiriFormField;
			ctrl = new FormControl<unknown>( selected );
			cmp = viewChild.required( XiriTreeselectComponent );
		}

		TestBed.configureTestingModule( {
			imports: [ Host ],
			providers: [
				{ provide: XiriDataService, useValue: { get: vi.fn() } },
				{ provide: XiriSnackbarService, useValue: { error: vi.fn() } },
			],
		} );
		const f = TestBed.createComponent( Host );
		f.detectChanges();
		return f;
	}

	beforeEach( () => TestBed.resetTestingModule() );

	it( 'behält eine ID oberhalb des int32-Bereichs exakt', () => {
		const big = 3000000000;
		const f = hostWith( [ big, 7 ], [ big ] );

		expect( f.componentInstance.cmp().value ).toEqual( [ big ] );
		expect( f.componentInstance.ctrl.value ).toEqual( [ big ] );
	} );

	it( 'behält gemischte String- und Zahl-IDs unverändert', () => {
		const f = hostWith( [ 'abc', 42 ], [ 'abc', 42 ] );

		expect( f.componentInstance.cmp().value ).toEqual( [ 'abc', 42 ] );
	} );

	// Die Weitung selbst ist eine Typänderung — die Runtime behandelte Strings schon
	// vorher unverändert. Der eigentliche Prüfer ist deshalb der Compiler: dieser
	// Aufruf ist ungecastet und schlägt bei writeValue( value: number[] ) fehl.
	it( 'nimmt String-IDs typgeprüft über die CVA-API an', () => {
		const f = hostWith( [ 'abc', 42 ], [] );
		const cmp: XiriTreeselectComponent = f.componentInstance.cmp();

		cmp.writeValue( [ 'abc' ] );
		f.detectChanges();

		expect( cmp.value ).toEqual( [ 'abc' ] );
	} );
} );
