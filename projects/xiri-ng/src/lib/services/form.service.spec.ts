import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { XiriFormService } from './form.service';
import { XiriDataService } from './data.service';
import { XiriSessionStorageService } from './sessionStorage.service';
import { XiriFormField } from '../formfields/field.interface';

describe( 'XiriFormService', () => {
	let service: XiriFormService;
	let dataService: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };
	let router: { navigate: ReturnType<typeof vi.fn> };
	let sessionStorage: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn>; getTimeout: ReturnType<typeof vi.fn> };

	beforeEach( () => {
		dataService = {
			get: vi.fn().mockReturnValue( of( {} ) ),
			post: vi.fn().mockReturnValue( of( {} ) ),
		};
		router = {
			navigate: vi.fn().mockReturnValue( Promise.resolve( true ) ),
		};
		sessionStorage = {
			get: vi.fn().mockReturnValue( null ),
			set: vi.fn(),
			getTimeout: vi.fn().mockReturnValue( null ),
		};

		TestBed.configureTestingModule( {
			providers: [
				XiriFormService,
				{ provide: XiriDataService, useValue: dataService },
				{ provide: Router, useValue: router },
				{ provide: XiriSessionStorageService, useValue: sessionStorage },
			],
		} );
		service = TestBed.inject( XiriFormService );
	} );

	it( 'should be created', () => {
		expect( service ).toBeTruthy();
	} );

	describe( 'get', () => {
		it( 'should call dataService.get when data is null', () => {
			dataService.get.mockReturnValue( of( { buttons: [{ label: 'OK' }] as any, fields: [], url: '/test' } ) );

			service.get( 'form/load', null ).subscribe();

			expect( dataService.get ).toHaveBeenCalledWith( 'form/load' );
			expect( dataService.post ).not.toHaveBeenCalled();
		} );

		it( 'should call dataService.post when data is provided', () => {
			const data = { id: 1 };
			dataService.post.mockReturnValue( of( { buttons: [{ label: 'OK' }] as any, fields: [], url: '/test' } ) );

			service.get( 'form/load', data ).subscribe();

			expect( dataService.post ).toHaveBeenCalledWith( 'form/load', { id: 1 } );
		} );

		it( 'should call dataService.post when data is undefined (no second arg)', () => {
			dataService.post.mockReturnValue( of( { buttons: [{ label: 'OK' }] as any, fields: [], url: '/test' } ) );

			service.get( 'form/load' ).subscribe();

			expect( dataService.post ).toHaveBeenCalled();
		} );

		it( 'should merge data with extra when posting', () => {
			const data = { id: 1 };
			const extra = { page: 2 };
			dataService.post.mockReturnValue( of( { buttons: [{ label: 'OK' }] as any, fields: [], url: '/test' } ) );

			service.get( 'form/load', data, extra ).subscribe();

			expect( dataService.post ).toHaveBeenCalledWith( 'form/load', { id: 1, page: 2 } );
		} );

		it( 'should handle HTTP error and transform to XiriFormServiceError', () => {
			const httpError = new HttpErrorResponse( {
				status: 400,
				error: { error: 'Invalid input' },
			} );
			dataService.post.mockReturnValue( throwError( () => httpError ) );

			let error: any;
			service.get( 'form/load', {} ).subscribe( {
				error: ( err ) => error = err,
			} );

			expect( error ).toEqual( { error: 'Invalid input' } );
		} );

		it( 'should handle 403 error', () => {
			const httpError = new HttpErrorResponse( { status: 403 } );
			dataService.post.mockReturnValue( throwError( () => httpError ) );

			let error: any;
			service.get( 'form/load', {} ).subscribe( {
				error: ( err ) => error = err,
			} );

			expect( error ).toEqual( { error: 'Access denied' } );
		} );

		it( 'should handle 404 error', () => {
			const httpError = new HttpErrorResponse( { status: 404 } );
			dataService.post.mockReturnValue( throwError( () => httpError ) );

			let error: any;
			service.get( 'form/load', {} ).subscribe( {
				error: ( err ) => error = err,
			} );

			expect( error ).toEqual( { error: 'Not found' } );
		} );

		it( 'should handle connection error (status 0)', () => {
			const httpError = new HttpErrorResponse( { status: 0 } );
			dataService.post.mockReturnValue( throwError( () => httpError ) );

			let error: any;
			service.get( 'form/load', {} ).subscribe( {
				error: ( err ) => error = err,
			} );

			expect( error ).toEqual( { error: 'Connection error' } );
		} );
	} );

	describe( 'parse', () => {
		it( 'should parse form response with buttons and fields', () => {
			const res = {
				url: '/submit',
				buttons: [{ label: 'Save' }],
				fields: [
					{ id: 'name', type: 'text' },
					{ id: 'age', type: 'number' },
				],
			};

			const result = service.parse( res as any );

			expect( result.url ).toBe( '/submit' );
			expect( result.buttons ).toEqual( [{ label: 'Save' }] );
			expect( result.fields!.length ).toBe( 2 );
			expect( result.type ).toBe( 'form' );
			expect( result.time ).toBe( 2000 );
		} );

		it( 'should apply model values to fields', () => {
			const res = {
				buttons: [{ label: 'Save' }],
				fields: [
					{ id: 'name', type: 'text' },
					{ id: 'email', type: 'text' },
				],
				model: { name: 'John' } as any,
			};

			const result = service.parse( res as any );

			const nameField = result.fields!.find( f => f.id === 'name' );
			const emailField = result.fields!.find( f => f.id === 'email' );
			expect( nameField!.value ).toBe( 'John' );
			expect( emailField!.value ).toBeUndefined();
		} );

		it( 'should filter out hidden fields', () => {
			const res = {
				buttons: [{ label: 'Save' }],
				fields: [
					{ id: 'visible', type: 'text' },
					{ id: 'hidden', type: 'text', hide: true },
				],
			};

			const result = service.parse( res as any );

			expect( result.fields!.length ).toBe( 1 );
			expect( result.fields![0].id ).toBe( 'visible' );
		} );

		it( 'should handle question type', () => {
			const res = {
				type: 'question',
				buttons: [{ label: 'Yes' }, { label: 'No' }],
				fields: { id: 'q1', text: 'Are you sure?' } as any,
			};

			const result = service.parse( res as any );

			expect( result.type ).toBe( 'question' );
			expect( result.fields!.length ).toBe( 1 );
			expect( ( result.fields![0] as any ).type ).toBe( 'question' );
		} );

		it( 'should handle waiting type', () => {
			const res = {
				type: 'waiting',
				buttons: [{ label: 'Cancel' }],
				fields: { id: 'w1', text: 'Processing...' } as any,
			};

			const result = service.parse( res as any );

			expect( result.type ).toBe( 'waiting' );
			expect( result.fields!.length ).toBe( 1 );
			const field = result.fields![0] as any;
			expect( field.type ).toBe( 'waiting' );
			expect( field.done ).toBe( false );
			expect( field.value ).toBe( 'Processing...' );
		} );

		it( 'should use default extra as empty object when not provided', () => {
			const res = {
				buttons: [{ label: 'OK' }],
				fields: [],
			};

			const result = service.parse( res as any );

			expect( result.extra ).toEqual( {} );
		} );

		it( 'should pass through extra when provided', () => {
			const res = {
				buttons: [{ label: 'OK' }],
				fields: [],
				extra: { key: 'value' } as any,
			};

			const result = service.parse( res as any );

			expect( result.extra ).toEqual( { key: 'value' } );
		} );

		it( 'should use provided time or default to 2000', () => {
			const withTime = {
				buttons: [{ label: 'OK' }],
				fields: [],
				time: 5000,
			};
			const withoutTime = {
				buttons: [{ label: 'OK' }],
				fields: [],
			};

			expect( service.parse( withTime as any ).time ).toBe( 5000 );
			expect( service.parse( withoutTime as any ).time ).toBe( 2000 );
		} );

		it( 'should return done observable with goto navigation', () => {
			return new Promise<void>( ( resolve ) => {
				const res = {
					goto: '/dashboard',
					done: false,
				};

				const result = service.parse( res as any );

				expect( result.done ).toBeTruthy();
				result.done!.subscribe( () => {
					expect( router.navigate ).toHaveBeenCalledWith( ['/dashboard'] );
					resolve();
				} );
			} );
		} );

		it( 'should return done observable with delay when done is true and goto', () => {
			return new Promise<void>( ( resolve ) => {
				const res = {
					goto: '/dashboard',
					done: true,
				};

				const result = service.parse( res as any );

				expect( result.done ).toBeTruthy();
				result.done!.subscribe( () => {
					expect( router.navigate ).toHaveBeenCalledWith( ['/dashboard'] );
					resolve();
				} );
			} );
		} );

		it( 'should return done observable without goto when no goto', () => {
			return new Promise<void>( ( resolve ) => {
				const res = {
					done: false,
				};

				const result = service.parse( res as any );

				expect( result.done ).toBeTruthy();
				result.done!.subscribe( () => {
					expect( router.navigate ).not.toHaveBeenCalled();
					resolve();
				} );
			} );
		} );

		it( 'should handle unknown form type gracefully', () => {
			const consoleSpy = vi.spyOn( console, 'log' ).mockImplementation( () => {} );
			const res = {
				type: 'unknown_type',
				buttons: [{ label: 'OK' }],
				fields: [],
			};

			const result = service.parse( res as any );

			expect( result.fields!.length ).toBe( 0 );
			expect( consoleSpy ).toHaveBeenCalledWith( 'XiriFormService unknown form type', 'unknown_type' );
			consoleSpy.mockRestore();
		} );
	} );

	describe( 'loadState', () => {
		it( 'should return fields unchanged when saveStateId is null', () => {
			const fields: XiriFormField[] = [{ id: 'name', type: 'text' }];
			const result = service.loadState( null, fields );
			expect( result ).toBe( fields );
		} );

		it( 'should return fields unchanged when saveStateId is undefined', () => {
			const fields: XiriFormField[] = [{ id: 'name', type: 'text' }];
			const result = service.loadState( undefined, fields );
			expect( result ).toBe( fields );
		} );

		it( 'should return fields unchanged when saveStateId is empty string', () => {
			const fields: XiriFormField[] = [{ id: 'name', type: 'text' }];
			const result = service.loadState( '', fields );
			expect( result ).toBe( fields );
		} );

		it( 'should return fields unchanged when no saved state exists', () => {
			sessionStorage.getTimeout.mockReturnValue( null );
			const fields: XiriFormField[] = [{ id: 'name', type: 'text' }];

			const result = service.loadState( 'state-1', fields );

			expect( result ).toBe( fields );
			expect( sessionStorage.getTimeout ).toHaveBeenCalledWith( 'state-1', 3600 );
		} );

		it( 'should restore bool field values', () => {
			sessionStorage.getTimeout.mockReturnValue( { active: true } );
			const fields: XiriFormField[] = [{ id: 'active', type: 'bool' }];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBe( true );
		} );

		it( 'should restore select field value when option exists in list', () => {
			sessionStorage.getTimeout.mockReturnValue( { status: 2 } );
			const fields: XiriFormField[] = [
				{
					id: 'status',
					type: 'select',
					list: [
						{ id: 1, name: 'Active' },
						{ id: 2, name: 'Inactive' },
					],
				},
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBe( 2 );
		} );

		it( 'should not restore select field value when option does not exist in list', () => {
			sessionStorage.getTimeout.mockReturnValue( { status: 99 } );
			const fields: XiriFormField[] = [
				{
					id: 'status',
					type: 'select',
					list: [
						{ id: 1, name: 'Active' },
						{ id: 2, name: 'Inactive' },
					],
				},
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBeUndefined();
		} );

		it( 'should not restore select field value when list is undefined', () => {
			sessionStorage.getTimeout.mockReturnValue( { status: 1 } );
			const fields: XiriFormField[] = [
				{ id: 'status', type: 'select' },
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBeUndefined();
		} );

		it( 'should restore object field value when option exists', () => {
			sessionStorage.getTimeout.mockReturnValue( { obj: 1 } );
			const fields: XiriFormField[] = [
				{
					id: 'obj',
					type: 'object',
					list: [{ id: 1, name: 'Item 1' }],
				},
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBe( 1 );
		} );

		it( 'should restore model field value when option exists', () => {
			sessionStorage.getTimeout.mockReturnValue( { mdl: 1 } );
			const fields: XiriFormField[] = [
				{
					id: 'mdl',
					type: 'model',
					list: [{ id: 1, name: 'Model 1' }],
				},
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBe( 1 );
		} );

		it( 'should restore date field value within min/max range', () => {
			sessionStorage.getTimeout.mockReturnValue( { date: 1700000000 } );
			const fields: XiriFormField[] = [
				{
					id: 'date',
					type: 'date',
					min: 1600000000,
					max: 1800000000,
				},
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBe( 1700000000 );
		} );

		it( 'should not restore date field value below min', () => {
			sessionStorage.getTimeout.mockReturnValue( { date: 1500000000 } );
			const fields: XiriFormField[] = [
				{
					id: 'date',
					type: 'date',
					min: 1600000000,
				},
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBeUndefined();
		} );

		it( 'should not restore date field value above max', () => {
			sessionStorage.getTimeout.mockReturnValue( { date: 1900000000 } );
			const fields: XiriFormField[] = [
				{
					id: 'date',
					type: 'date',
					max: 1800000000,
				},
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBeUndefined();
		} );

		it( 'should restore date field value when no min/max constraints', () => {
			sessionStorage.getTimeout.mockReturnValue( { date: 1700000000 } );
			const fields: XiriFormField[] = [
				{ id: 'date', type: 'date' },
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBe( 1700000000 );
		} );

		it( 'should not restore daterange fields', () => {
			sessionStorage.getTimeout.mockReturnValue( { range: [1, 2] } );
			const fields: XiriFormField[] = [
				{ id: 'range', type: 'daterange' },
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBeUndefined();
		} );

		it( 'should not restore datetimerange fields', () => {
			sessionStorage.getTimeout.mockReturnValue( { range: [1, 2] } );
			const fields: XiriFormField[] = [
				{ id: 'range', type: 'datetimerange' },
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBeUndefined();
		} );

		it( 'should skip fields not present in saved data', () => {
			sessionStorage.getTimeout.mockReturnValue( { other: 'value' } );
			const fields: XiriFormField[] = [
				{ id: 'name', type: 'text', value: 'original' },
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBe( 'original' );
		} );

		it( 'should not restore unknown field types (default case)', () => {
			sessionStorage.getTimeout.mockReturnValue( { txt: 'hello' } );
			const fields: XiriFormField[] = [
				{ id: 'txt', type: 'text' },
			];

			service.loadState( 'state-1', fields );

			expect( fields[0].value ).toBeUndefined();
		} );
	} );

	describe( 'saveState', () => {
		it( 'should save values to session storage', () => {
			const values = { name: 'John', age: 30 };
			service.saveState( 'state-1', values );

			expect( sessionStorage.set ).toHaveBeenCalledWith( 'state-1', values );
		} );

		it( 'should not save when saveStateId is null', () => {
			service.saveState( null, { name: 'John' } );
			expect( sessionStorage.set ).not.toHaveBeenCalled();
		} );

		it( 'should not save when saveStateId is undefined', () => {
			service.saveState( undefined, { name: 'John' } );
			expect( sessionStorage.set ).not.toHaveBeenCalled();
		} );

		it( 'should not save when saveStateId is empty string', () => {
			service.saveState( '', { name: 'John' } );
			expect( sessionStorage.set ).not.toHaveBeenCalled();
		} );
	} );
} );
