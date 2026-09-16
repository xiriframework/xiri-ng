import { describe, it, expect, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ApplicationRef, Component, signal, viewChild } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { enUS } from 'date-fns/locale/en-US';
import { XiriFormFieldsComponent } from './form-fields.component';
import { XiriFormField } from './field.interface';
import { XiriDataServiceConfig } from '../services/data.service';

@Component( {
	selector: 'xiri-form-fields-add-host',
	template: `<xiri-form-fields [form]="fields()" />`,
	imports: [ XiriFormFieldsComponent ],
} )
class HostComponent {
	fields = signal<XiriFormField[] | null>( null );
	formFields = viewChild.required( XiriFormFieldsComponent );
}

// Integration ohne Mocks am Dialog: echter XiriDialogComponent im Overlay, echter XiriDataService,
// nur HTTP ist abgefangen. Deckt den ganzen Weg Klick → GET → Formular → POST → created → Feldwert ab.
describe( 'addUrl Integration: Option per echtem Dialog anlegen', () => {

	afterEach( () => {
		TestBed.inject( OverlayContainer ).ngOnDestroy();
	} );

	it( 'legt eine Option an und selektiert sie im Feld', async () => {
		TestBed.configureTestingModule( {
			imports: [ HostComponent ],
			providers: [
				provideHttpClient(), provideHttpClientTesting(), provideRouter( [] ),
				{ provide: XiriDataServiceConfig, useValue: { api: '/api/' } },
				{ provide: MAT_DATE_LOCALE, useValue: enUS },
				...provideDateFnsAdapter(),
			],
		} );
		const fixture = TestBed.createComponent( HostComponent );
		const http = TestBed.inject( HttpTestingController );
		const appRef = TestBed.inject( ApplicationRef );
		const overlay = TestBed.inject( OverlayContainer ).getContainerElement();

		fixture.componentInstance.fields.set( [ {
			id: 'tag', type: 'select', multiple: true, required: false, search: false, value: [ 10 ],
			list: [ { id: 10, name: 'Alpha' } ], addUrl: 'Thing/Add',
		} ] );
		fixture.detectChanges();
		const control = fixture.componentInstance.formFields().formGroup.get( 'tag' )!;

		( fixture.nativeElement.querySelector( 'button.add-option' ) as HTMLButtonElement ).click();

		// Der Dialog wird lazy importiert, dann lädt er sein Formular per GET.
		const get = await vi.waitFor( () => http.expectOne( { method: 'GET', url: '/api/Thing/Add' } ) );
		get.flush( {
			header: 'Neuer Tag', type: 'form', url: 'Thing/Add',
			fields: [ { id: 'name', type: 'text', name: 'Name', required: true, value: '' } ],
			buttons: [ { text: 'Anlegen', type: 'raised', action: 'save', default: true, color: 'primary' } ],
		} );
		appRef.tick();

		const input = overlay.querySelector( 'input' ) as HTMLInputElement;
		expect( input ).toBeTruthy();
		input.value = 'Neu';
		input.dispatchEvent( new Event( 'input' ) );
		appRef.tick();

		( overlay.querySelector( 'xiri-buttonstyle' ) as HTMLElement ).click();

		const post = await vi.waitFor( () => http.expectOne( { method: 'POST', url: '/api/Thing/Add' } ) );
		expect( post.request.body ).toEqual( { name: 'Neu' } );
		post.flush( { done: true, created: { id: 99, name: 'Neu' } } );
		appRef.tick();

		// Erfolgsanzeige, dann schließt der Dialog nach 1 s mit der Antwort.
		await vi.waitFor( () => expect( control.value ).toEqual( [ 10, 99 ] ), { timeout: 4000 } );
		expect( fixture.componentInstance.formFields().fields()![ 0 ].list ).toContainEqual( { id: 99, name: 'Neu' } );
		http.verify();
	}, 10000 );
} );
