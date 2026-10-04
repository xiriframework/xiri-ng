import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, inputBinding, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { XiriSuggestDirective } from './suggest.directive';
import { XiriFormField, XiriFormFieldSelectOption } from '../field.interface';
import { XiriDataService } from '../../services/data.service';

const WIEN = { id: 'Wien', name: 'Wien' };
const GRAZ = { id: 'Graz', name: 'Graz' };
const GRAMBACH = { id: 'Grambach', name: 'Grambach' };

@Component( {
	selector: 'xiri-suggest-test-host',
	template: `<form [formGroup]="fg"><input formControlName="city" [xiriSuggest]="field()"></form>`,
	imports: [ ReactiveFormsModule, XiriSuggestDirective ],
} )
class TestHostComponent {
	fg = new FormGroup( {
		city: new FormControl( '' ),
		dept: new FormControl<unknown>( 3 ),
		kind: new FormControl( { value: 'x', disabled: true } ),
	} );
	field = signal<XiriFormField>( { type: 'text', id: 'city', list: [ WIEN, GRAZ ] } );
	dir = viewChild.required( XiriSuggestDirective );
}

describe( 'XiriSuggestDirective', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let post: ReturnType<typeof vi.fn>;

	const names = () => host.dir().options().map( o => o.name );
	const input = () => fixture.nativeElement.querySelector( 'input' ) as HTMLInputElement;
	const type = ( text: string ) => {
		input().value = text;
		input().dispatchEvent( new Event( 'input' ) );
		fixture.detectChanges();
	};
	const setField = async ( extra: Partial<XiriFormField> ) => {
		host.field.set( { ...host.field(), ...extra } );
		fixture.detectChanges();
		await fixture.whenStable();
	};

	beforeEach( async () => {
		vi.useFakeTimers();
		post = vi.fn().mockReturnValue( of( [] ) );
		TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [ { provide: XiriDataService, useValue: { post } } ],
		} );
		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
		await fixture.whenStable();
	} );

	afterEach( () => vi.useRealTimers() );

	it( 'filtert die feste Liste lokal', () => {
		type( 'gr' );
		expect( names() ).toEqual( [ 'Graz' ] );
		type( '' );
		expect( names() ).toEqual( [ 'Wien', 'Graz' ] );
	} );

	it( 'zeigt ohne Eingabe die ganze Liste', () => {
		expect( names() ).toEqual( [ 'Wien', 'Graz' ] );
	} );

	it( 'übernimmt eine gepatchte Liste ohne neue Eingabe', async () => {
		type( 'gr' );
		await setField( { list: [ GRAZ, GRAMBACH ] } );
		expect( names() ).toEqual( [ 'Graz', 'Grambach' ] );
	} );

	it( 'fragt ohne url nie den Server', () => {
		type( 'gr' );
		vi.advanceTimersByTime( 300 );
		expect( post ).not.toHaveBeenCalled();
	} );

	it( 'lädt mit url nach 200 ms nach und hängt Servertreffer an', async () => {
		await setField( { url: 'City/Search' } );
		post.mockReturnValue( of( [ GRAMBACH, GRAZ ] ) );
		type( 'gr' );
		vi.advanceTimersByTime( 199 );
		expect( post ).not.toHaveBeenCalled();
		vi.advanceTimersByTime( 1 );
		expect( post ).toHaveBeenCalledWith( 'City/Search', { search: 'gr' } );
		expect( names() ).toEqual( [ 'Graz', 'Grambach' ] );
	} );

	it( 'bricht bei neuer Eingabe die alte Suche ab', async () => {
		await setField( { url: 'City/Search' } );
		const first = new Subject<XiriFormFieldSelectOption[]>();
		post.mockReturnValueOnce( first ).mockReturnValue( of( [] ) );
		type( 'gr' );
		vi.advanceTimersByTime( 200 );
		type( 'wi' );
		first.next( [ { id: 'Graz-Server', name: 'Graz-Server' } ] );
		expect( names() ).toEqual( [ 'Wien' ] );
		vi.advanceTimersByTime( 200 );
		expect( post ).toHaveBeenLastCalledWith( 'City/Search', { search: 'wi' } );
	} );

	it( 'leert Servertreffer bei leerer Eingabe', async () => {
		await setField( { url: 'City/Search' } );
		post.mockReturnValue( of( [ GRAMBACH ] ) );
		type( 'gr' );
		vi.advanceTimersByTime( 200 );
		expect( names() ).toEqual( [ 'Graz', 'Grambach' ] );
		type( '' );
		vi.advanceTimersByTime( 300 );
		expect( names() ).toEqual( [ 'Wien', 'Graz' ] );
		expect( post ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'liefert bei Serverfehler nur die lokale Liste und sucht danach wieder', async () => {
		await setField( { url: 'City/Search' } );
		post.mockReturnValueOnce( throwError( () => new Error( 'down' ) ) ).mockReturnValue( of( [ GRAMBACH ] ) );
		type( 'gr' );
		vi.advanceTimersByTime( 200 );
		expect( names() ).toEqual( [ 'Graz' ] );
		type( 'gra' );
		vi.advanceTimersByTime( 200 );
		expect( names() ).toEqual( [ 'Graz', 'Grambach' ] );
	} );

	it( 'verwirft defekte Antwort-Elemente und Nicht-Arrays', async () => {
		await setField( { url: 'City/Search' } );
		post.mockReturnValueOnce( of( {} ) );
		type( 'gr' );
		vi.advanceTimersByTime( 200 );
		expect( names() ).toEqual( [ 'Graz' ] );
		post.mockReturnValueOnce( of( [ null, { id: 1 }, GRAZ, GRAMBACH ] ) );
		type( 'gra' );
		vi.advanceTimersByTime( 200 );
		expect( names() ).toEqual( [ 'Graz', 'Grambach' ] );
	} );

	it( 'dedupliziert auch innerhalb einer Quelle', async () => {
		await setField( { url: 'City/Search', list: [ GRAZ, GRAZ ] } );
		post.mockReturnValue( of( [ GRAMBACH, GRAMBACH ] ) );
		type( 'gr' );
		vi.advanceTimersByTime( 200 );
		expect( names() ).toEqual( [ 'Graz', 'Grambach' ] );
	} );

	it( 'Fokus filtert lokal, fragt aber nicht den Server', async () => {
		await setField( { url: 'City/Search' } );
		input().value = 'gr'; // vorbelegter Wert, kein input-Event
		input().dispatchEvent( new Event( 'focus' ) );
		fixture.detectChanges();
		vi.advanceTimersByTime( 300 );
		expect( names() ).toEqual( [ 'Graz' ] );
		expect( post ).not.toHaveBeenCalled();
	} );

	it( 'Fokus mit geändertem Wert verwirft alte Servertreffer und den laufenden Request', async () => {
		await setField( { url: 'City/Search' } );
		const pending = new Subject<XiriFormFieldSelectOption[]>();
		post.mockReturnValue( pending );
		type( 'gr' );
		vi.advanceTimersByTime( 200 );
		input().dispatchEvent( new Event( 'blur' ) );
		input().value = 'Wien'; // programmatisch, kein input-Event
		input().dispatchEvent( new Event( 'focus' ) );
		fixture.detectChanges();
		pending.next( [ { id: 'Graz-Server', name: 'Graz-Server' } ] );
		expect( names() ).toEqual( [ 'Wien' ] );
		vi.advanceTimersByTime( 300 );
		expect( post ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Feldwechsel setzt zurück und sucht nicht', async () => {
		await setField( { url: 'Old/Search' } );
		const pending = new Subject<XiriFormFieldSelectOption[]>();
		post.mockReturnValueOnce( pending ).mockReturnValue( of( [] ) );
		type( 'gr' );
		vi.advanceTimersByTime( 200 );
		expect( post ).toHaveBeenCalledTimes( 1 );
		await setField( { url: 'New/Search', list: [ WIEN ] } );
		pending.next( [ { id: 'Alt', name: 'Alt' } ] );
		expect( names() ).toEqual( [ 'Wien' ] );
		vi.advanceTimersByTime( 300 );
		expect( post ).toHaveBeenCalledTimes( 1 );
		type( 'wi' );
		vi.advanceTimersByTime( 200 );
		expect( post ).toHaveBeenLastCalledWith( 'New/Search', { search: 'wi' } );
	} );

	it( 'schickt die aktuellen Werte der enabled searchWith-Felder mit', async () => {
		await setField( { url: 'City/Search', searchWith: [ 'dept', 'kind', 'missing' ] } );
		type( 'gr' );
		vi.advanceTimersByTime( 100 );
		host.fg.get( 'dept' )!.setValue( 7 ); // Kontext ändert sich noch vor dem Request
		vi.advanceTimersByTime( 100 );
		expect( post ).toHaveBeenCalledWith( 'City/Search', { dept: 7, search: 'gr' } );
		for ( const v of [ 0, null, false, [] ] ) {
			host.fg.get( 'dept' )!.setValue( v );
			type( 'gr' + String( v ) );
			vi.advanceTimersByTime( 200 );
			expect( post ).toHaveBeenLastCalledWith( 'City/Search', { dept: v, search: 'gr' + String( v ) } );
		}
	} );

	it( 'schickt keine Kontextwerte, wenn die Gruppe vor dem Request deaktiviert wird', async () => {
		await setField( { url: 'City/Search', searchWith: [ 'dept', 'kind' ] } );
		type( 'gr' );
		vi.advanceTimersByTime( 100 );
		host.fg.disable();
		vi.advanceTimersByTime( 100 );
		expect( post ).toHaveBeenCalledWith( 'City/Search', { search: 'gr' } );
	} );
} );

describe( 'XiriSuggestDirective ohne formGroup', () => {
	it( 'schickt nur search mit', async () => {
		vi.useFakeTimers();
		const post = vi.fn().mockReturnValue( of( [] ) );
		TestBed.configureTestingModule( {
			providers: [ { provide: XiriDataService, useValue: { post } } ],
		} );
		const field: XiriFormField = { type: 'text', id: 'city', url: 'City/Search', searchWith: [ 'dept' ] };
		const fixture = TestBed.createDirective( XiriSuggestDirective, { bindings: [ inputBinding( 'xiriSuggest', () => field ) ] } );
		fixture.detectChanges();
		await fixture.whenStable();
		const input = fixture.nativeElement as HTMLInputElement;
		input.value = 'gr';
		input.dispatchEvent( new Event( 'input' ) );
		vi.advanceTimersByTime( 200 );
		expect( post ).toHaveBeenCalledWith( 'City/Search', { search: 'gr' } );
		vi.useRealTimers();
	} );
} );
