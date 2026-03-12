import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriSessionStorageService } from './sessionStorage.service';

describe( 'XiriSessionStorageService', () => {
	let service: XiriSessionStorageService;
	let mockSessionStorage: { [key: string]: string };

	let getItemSpy: ReturnType<typeof vi.fn>;
	let setItemSpy: ReturnType<typeof vi.fn>;
	let removeItemSpy: ReturnType<typeof vi.fn>;
	let clearSpy: ReturnType<typeof vi.fn>;

	beforeEach( () => {
		mockSessionStorage = {};

		getItemSpy = vi.fn( ( key: string ) => {
			return mockSessionStorage[key] || null;
		} );
		setItemSpy = vi.fn( ( key: string, value: string ) => {
			mockSessionStorage[key] = value;
		} );
		removeItemSpy = vi.fn( ( key: string ) => {
			delete mockSessionStorage[key];
		} );
		clearSpy = vi.fn( () => {
			mockSessionStorage = {};
		} );

		vi.stubGlobal( 'sessionStorage', {
			getItem: getItemSpy,
			setItem: setItemSpy,
			removeItem: removeItemSpy,
			clear: clearSpy,
			length: 0,
			key: vi.fn(),
		} );

		TestBed.configureTestingModule( {
			providers: [XiriSessionStorageService],
		} );
		service = TestBed.inject( XiriSessionStorageService );
	} );

	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( 'should be created', () => {
		expect( service ).toBeTruthy();
	} );

	describe( 'set and get', () => {
		it( 'should store and retrieve a string value', () => {
			service.set( 'key1', 'hello' );
			expect( service.get( 'key1' ) ).toBe( 'hello' );
		} );

		it( 'should store and retrieve an object value', () => {
			const obj = { name: 'test', count: 42 };
			service.set( 'obj', obj );
			expect( service.get( 'obj' ) ).toEqual( obj );
		} );

		it( 'should store and retrieve a number value', () => {
			service.set( 'num', 123 );
			expect( service.get( 'num' ) ).toBe( 123 );
		} );

		it( 'should store and retrieve a boolean value', () => {
			service.set( 'bool', true );
			expect( service.get( 'bool' ) ).toBe( true );
		} );

		it( 'should store and retrieve null value', () => {
			service.set( 'nullable', null );
			expect( service.get( 'nullable' ) ).toBeNull();
		} );

		it( 'should store and retrieve an array value', () => {
			service.set( 'arr', [1, 2, 3] );
			expect( service.get( 'arr' ) ).toEqual( [1, 2, 3] );
		} );

		it( 'should overwrite existing values', () => {
			service.set( 'key', 'first' );
			service.set( 'key', 'second' );
			expect( service.get( 'key' ) ).toBe( 'second' );
		} );

		it( 'should persist to sessionStorage', () => {
			service.set( 'persist', 'value' );
			expect( setItemSpy ).toHaveBeenCalled();
			const call = setItemSpy.mock.calls.find( ( c: any[] ) => c[0] === 'persist' );
			expect( call ).toBeTruthy();
			const parsed = JSON.parse( call![1] );
			expect( parsed.value ).toBe( 'value' );
			expect( parsed.time ).toBeDefined();
		} );
	} );

	describe( 'get', () => {
		it( 'should return null for non-existent key', () => {
			expect( service.get( 'nonexistent' ) ).toBeNull();
		} );

		it( 'should fall back to sessionStorage if not in memory', () => {
			const stored = JSON.stringify( { time: Date.now(), value: 'from-storage' } );
			mockSessionStorage['fallback'] = stored;

			expect( service.get( 'fallback' ) ).toBe( 'from-storage' );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove a stored value', () => {
			service.set( 'toRemove', 'data' );
			service.remove( 'toRemove' );
			expect( service.get( 'toRemove' ) ).toBeNull();
		} );

		it( 'should call sessionStorage.removeItem', () => {
			service.set( 'key', 'value' );
			service.remove( 'key' );
			expect( removeItemSpy ).toHaveBeenCalledWith( 'key' );
		} );

		it( 'should not throw when removing non-existent key', () => {
			expect( () => service.remove( 'doesNotExist' ) ).not.toThrow();
		} );
	} );

	describe( 'clear', () => {
		it( 'should remove all stored values', () => {
			service.set( 'a', 1 );
			service.set( 'b', 2 );
			service.clear();
			expect( service.get( 'a' ) ).toBeNull();
			expect( service.get( 'b' ) ).toBeNull();
		} );

		it( 'should call sessionStorage.clear', () => {
			service.clear();
			expect( clearSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'getTimeout', () => {
		it( 'should return value when within timeout', () => {
			service.set( 'recent', 'data' );
			expect( service.getTimeout( 'recent', 3600 ) ).toBe( 'data' );
		} );

		it( 'should return null when expired', () => {
			const oldTime = Date.now() - 7200 * 1000; // 2 hours ago
			const stored = JSON.stringify( { time: oldTime, value: 'old-data' } );
			mockSessionStorage['expired'] = stored;

			expect( service.getTimeout( 'expired', 3600 ) ).toBeNull();
		} );

		it( 'should remove expired entries', () => {
			const oldTime = Date.now() - 7200 * 1000;
			const stored = JSON.stringify( { time: oldTime, value: 'old-data' } );
			mockSessionStorage['expired'] = stored;

			service.getTimeout( 'expired', 3600 );

			expect( removeItemSpy ).toHaveBeenCalledWith( 'expired' );
		} );

		it( 'should return null for non-existent key', () => {
			expect( service.getTimeout( 'nope', 3600 ) ).toBeNull();
		} );

		it( 'should return value at exact boundary', () => {
			vi.spyOn( Date, 'now' ).mockReturnValue( 1000000 );
			service.set( 'boundary', 'data' );
			// Now getTimeout with the same time should still return data
			expect( service.getTimeout( 'boundary', 3600 ) ).toBe( 'data' );
			vi.restoreAllMocks();
		} );

		it( 'should handle zero maxTime', () => {
			// Set a value with a slightly older timestamp
			const oldTime = Date.now() - 1;
			const stored = JSON.stringify( { time: oldTime, value: 'instant' } );
			mockSessionStorage['instant'] = stored;

			expect( service.getTimeout( 'instant', 0 ) ).toBeNull();
		} );
	} );
} );
