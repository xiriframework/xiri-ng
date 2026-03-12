import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { XiriDataService, XiriDataServiceConfig } from './data.service';
import { XiriSnackbarService } from './snackbar.service';

describe( 'XiriDataService', () => {
	let service: XiriDataService;
	let httpClient: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };
	let snackbar: { handleResponse: ReturnType<typeof vi.fn> };
	let config: XiriDataServiceConfig;

	beforeEach( () => {
		httpClient = {
			get: vi.fn().mockReturnValue( of( {} ) ),
			post: vi.fn().mockReturnValue( of( {} ) ),
		};
		snackbar = { handleResponse: vi.fn() };
		config = { api: '/api/' };

		TestBed.configureTestingModule( {
			providers: [
				XiriDataService,
				{ provide: HttpClient, useValue: httpClient },
				{ provide: XiriDataServiceConfig, useValue: config },
				{ provide: XiriSnackbarService, useValue: snackbar },
			],
		} );
		service = TestBed.inject( XiriDataService );
	} );

	it( 'should be created', () => {
		expect( service ).toBeTruthy();
	} );

	describe( 'get', () => {
		it( 'should call HttpClient.get with full URL', () => {
			const response = { data: 'test' };
			httpClient.get.mockReturnValue( of( response ) );

			service.get( 'users' ).subscribe();

			expect( httpClient.get ).toHaveBeenCalledWith( '/api/users' );
		} );

		it( 'should pass response to snackbar.handleResponse', () => {
			const response = { message: 'Done', messageType: 'success' };
			httpClient.get.mockReturnValue( of( response ) );

			service.get( 'test' ).subscribe();

			expect( snackbar.handleResponse ).toHaveBeenCalledWith( response );
		} );

		it( 'should emit the response from the observable', () => {
			const response = { data: 'value' };
			httpClient.get.mockReturnValue( of( response ) );

			let result: any;
			service.get( 'test' ).subscribe( res => result = res );

			expect( result ).toEqual( response );
		} );

		it( 'should prepend config api to url', () => {
			config.api = '/custom-api/';
			httpClient.get.mockReturnValue( of( {} ) );

			service.get( 'items' ).subscribe();

			expect( httpClient.get ).toHaveBeenCalledWith( '/custom-api/items' );
		} );

		it( 'should handle empty url', () => {
			httpClient.get.mockReturnValue( of( {} ) );

			service.get( '' ).subscribe();

			expect( httpClient.get ).toHaveBeenCalledWith( '/api/' );
		} );
	} );

	describe( 'post', () => {
		it( 'should call HttpClient.post with full URL and data', () => {
			const data = { name: 'test' };
			httpClient.post.mockReturnValue( of( {} ) );

			service.post( 'users', data ).subscribe();

			expect( httpClient.post ).toHaveBeenCalledWith( '/api/users', data );
		} );

		it( 'should pass response to snackbar.handleResponse', () => {
			const response = { message: 'Saved', messageType: 'success' };
			httpClient.post.mockReturnValue( of( response ) );

			service.post( 'save', {} ).subscribe();

			expect( snackbar.handleResponse ).toHaveBeenCalledWith( response );
		} );

		it( 'should emit the response from the observable', () => {
			const response = { id: 1 };
			httpClient.post.mockReturnValue( of( response ) );

			let result: any;
			service.post( 'create', { name: 'a' } ).subscribe( res => result = res );

			expect( result ).toEqual( response );
		} );

		it( 'should handle null data', () => {
			httpClient.post.mockReturnValue( of( {} ) );

			service.post( 'test', null ).subscribe();

			expect( httpClient.post ).toHaveBeenCalledWith( '/api/test', null );
		} );
	} );

	describe( 'postFile', () => {
		it( 'should call HttpClient.post with blob responseType', () => {
			httpClient.post.mockReturnValue( of( new Blob() ) );

			service.postFile( 'download', { id: 1 } ).subscribe();

			expect( httpClient.post ).toHaveBeenCalledWith( '/api/download', { id: 1 }, { responseType: 'blob' } );
		} );

		it( 'should not call snackbar.handleResponse', () => {
			httpClient.post.mockReturnValue( of( new Blob() ) );

			service.postFile( 'download', {} ).subscribe();

			expect( snackbar.handleResponse ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'postFileResponse', () => {
		it( 'should call HttpClient.post with observe response and blob responseType', () => {
			httpClient.post.mockReturnValue( of( { body: new Blob(), headers: {} } ) );

			service.postFileResponse( 'export', { format: 'csv' } ).subscribe();

			expect( httpClient.post ).toHaveBeenCalledWith(
				'/api/export',
				{ format: 'csv' },
				{ observe: 'response', responseType: 'blob' }
			);
		} );
	} );

	describe( 'postDownload', () => {
		it( 'should create and submit a form element', () => {
			const mockForm = {
				target: '',
				method: '',
				action: '',
				appendChild: vi.fn(),
				submit: vi.fn(),
			};
			const mockInput = {
				type: '',
				name: '',
				setAttribute: vi.fn(),
			};

			vi.spyOn( document, 'createElement' ).mockImplementation( ( tag: string ) => {
				if ( tag === 'form' ) return mockForm as any;
				if ( tag === 'input' ) return mockInput as any;
				return document.createElement( tag );
			} );
			vi.spyOn( document.body, 'appendChild' ).mockImplementation( vi.fn() );

			const data = { key: 'value' };
			service.postDownload( '/download/file', data );

			expect( mockForm.target ).toBe( '_blank' );
			expect( mockForm.method ).toBe( 'POST' );
			expect( mockForm.action ).toBe( '/download/file' );
			expect( mockInput.type ).toBe( 'hidden' );
			expect( mockInput.name ).toBe( 'data' );
			expect( mockInput.setAttribute ).toHaveBeenCalledWith( 'value', JSON.stringify( data ) );
			expect( mockForm.appendChild ).toHaveBeenCalledWith( mockInput );
			expect( mockForm.submit ).toHaveBeenCalled();

			vi.restoreAllMocks();
		} );
	} );

	describe( 'getConfigApi', () => {
		it( 'should return the config api value', () => {
			expect( service.getConfigApi() ).toBe( '/api/' );
		} );
	} );
} );
