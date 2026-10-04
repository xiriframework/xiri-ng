import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpBackend, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap, throwError, timer } from 'rxjs';
import { appProviders } from '../app/app.config';
import { AppComponent } from '../app/app.component';

// Requests the mock interceptor passes on would hit the network; in tests they end as 404.
// Asynchronous like a real network: a synchronous error would hide missing change detection (zoneless).
const notFoundBackend: HttpBackend = {
	handle: req => timer( 0 ).pipe( switchMap( () => throwError( () =>
		new HttpErrorResponse( { status: 404, statusText: 'Not Found', url: req.url } ) ) ) ),
};

// Renders the real AppComponent: XiriLocaleService (created there) sets the date-fns locale,
// without it date fields crash in DateFnsAdapter.format.
export async function renderDemo( url: string ): Promise<ComponentFixture<AppComponent>> {
	localStorage.clear();
	TestBed.configureTestingModule( {
		providers: [ ...appProviders, { provide: HttpBackend, useValue: notFoundBackend } ],
	} );
	const fixture = TestBed.createComponent( AppComponent );
	await TestBed.inject( Router ).navigateByUrl( url );
	await fixture.whenStable();
	return fixture;
}

// For results of user actions (clicks, selections): poll until the page shows them.
export async function waitFor( fixture: ComponentFixture<unknown>, check: () => boolean, timeout = 3000 ): Promise<void> {
	const end = Date.now() + timeout;
	while ( !check() ) {
		if ( Date.now() > end )
			throw new Error( `waitFor: condition not met within ${ timeout } ms` );
		await new Promise( resolve => setTimeout( resolve, 20 ) );
		await fixture.whenStable();
	}
}

export function mainText( fixture: ComponentFixture<AppComponent> ): string {
	return ( fixture.nativeElement.querySelector( '.mainpage' ) as HTMLElement ).textContent ?? '';
}
