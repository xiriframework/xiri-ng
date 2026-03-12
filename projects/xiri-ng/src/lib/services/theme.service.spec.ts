import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService, ThemeMode } from './theme.service';

describe( 'ThemeService', () => {
	let service: ThemeService;
	let mediaQueryListeners: ( ( e: any ) => void )[];
	let mockMediaQueryResult: { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> };
	let localStorageStore: { [key: string]: string };
	let setItemSpy: ReturnType<typeof vi.fn>;
	let getItemSpy: ReturnType<typeof vi.fn>;

	const createMockMediaQuery = ( matches: boolean ) => {
		mockMediaQueryResult = {
			matches,
			addEventListener: vi.fn( ( _event: string, cb: any ) => {
				mediaQueryListeners.push( cb );
			} ),
			removeEventListener: vi.fn(),
		};
		return mockMediaQueryResult;
	};

	beforeEach( () => {
		mediaQueryListeners = [];
		localStorageStore = {};

		getItemSpy = vi.fn( ( key: string ) => localStorageStore[key] ?? null );
		setItemSpy = vi.fn( ( key: string, value: string ) => {
			localStorageStore[key] = value;
		} );

		vi.stubGlobal( 'localStorage', {
			getItem: getItemSpy,
			setItem: setItemSpy,
			removeItem: vi.fn(),
			clear: vi.fn(),
			length: 0,
			key: vi.fn(),
		} );

		const mockMediaQuery = createMockMediaQuery( false );
		vi.stubGlobal( 'matchMedia', vi.fn().mockReturnValue( mockMediaQuery ) );

		// Clean up document classes
		document.documentElement.classList.remove( 'light-theme', 'dark-theme' );
	} );

	afterEach( () => {
		vi.unstubAllGlobals();
		document.documentElement.classList.remove( 'light-theme', 'dark-theme' );
	} );

	const createService = ( platformId: string = 'browser' ) => {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( {
			providers: [
				ThemeService,
				{ provide: PLATFORM_ID, useValue: platformId },
			],
		} );
		return TestBed.inject( ThemeService );
	};

	it( 'should be created', () => {
		service = createService();
		expect( service ).toBeTruthy();
	} );

	it( 'should default to auto mode', () => {
		service = createService();
		expect( service.mode() ).toBe( 'auto' );
	} );

	describe( 'browser platform', () => {
		beforeEach( () => {
			service = createService( 'browser' );
		} );

		it( 'should load saved theme from localStorage', () => {
			localStorageStore['theme'] = 'dark';
			service = createService( 'browser' );
			expect( service.mode() ).toBe( 'dark' );
		} );

		it( 'should ignore invalid saved theme values', () => {
			localStorageStore['theme'] = 'invalid';
			service = createService( 'browser' );
			expect( service.mode() ).toBe( 'auto' );
		} );

		it( 'should load light theme from localStorage', () => {
			localStorageStore['theme'] = 'light';
			service = createService( 'browser' );
			expect( service.mode() ).toBe( 'light' );
		} );
	} );

	describe( 'setTheme', () => {
		beforeEach( () => {
			service = createService( 'browser' );
		} );

		it( 'should set mode to light', () => {
			service.setTheme( 'light' );
			expect( service.mode() ).toBe( 'light' );
		} );

		it( 'should set mode to dark', () => {
			service.setTheme( 'dark' );
			expect( service.mode() ).toBe( 'dark' );
		} );

		it( 'should set mode to auto', () => {
			service.setTheme( 'dark' );
			service.setTheme( 'auto' );
			expect( service.mode() ).toBe( 'auto' );
		} );

		it( 'should persist to localStorage', () => {
			service.setTheme( 'dark' );
			expect( setItemSpy ).toHaveBeenCalledWith( 'theme', 'dark' );
		} );
	} );

	describe( 'isDark', () => {
		it( 'should return true when mode is dark', () => {
			service = createService( 'browser' );
			service.setTheme( 'dark' );
			expect( service.isDark() ).toBe( true );
		} );

		it( 'should return false when mode is light', () => {
			service = createService( 'browser' );
			service.setTheme( 'light' );
			expect( service.isDark() ).toBe( false );
		} );

		it( 'should follow system preference when mode is auto and prefers dark', () => {
			const mockMediaQuery = createMockMediaQuery( true );
			( window.matchMedia as ReturnType<typeof vi.fn> ).mockReturnValue( mockMediaQuery );
			service = createService( 'browser' );
			expect( service.isDark() ).toBe( true );
		} );

		it( 'should follow system preference when mode is auto and prefers light', () => {
			const mockMediaQuery = createMockMediaQuery( false );
			( window.matchMedia as ReturnType<typeof vi.fn> ).mockReturnValue( mockMediaQuery );
			service = createService( 'browser' );
			expect( service.isDark() ).toBe( false );
		} );
	} );

	describe( 'isLight', () => {
		it( 'should be inverse of isDark', () => {
			service = createService( 'browser' );
			service.setTheme( 'dark' );
			expect( service.isLight() ).toBe( false );

			service.setTheme( 'light' );
			expect( service.isLight() ).toBe( true );
		} );
	} );

	describe( 'toggle', () => {
		beforeEach( () => {
			service = createService( 'browser' );
		} );

		it( 'should toggle from light to dark', () => {
			service.setTheme( 'light' );
			service.toggle();
			expect( service.mode() ).toBe( 'dark' );
		} );

		it( 'should toggle from dark to light', () => {
			service.setTheme( 'dark' );
			service.toggle();
			expect( service.mode() ).toBe( 'light' );
		} );

		it( 'should switch to light when auto and system prefers dark', () => {
			const mockMediaQuery = createMockMediaQuery( true );
			( window.matchMedia as ReturnType<typeof vi.fn> ).mockReturnValue( mockMediaQuery );
			service = createService( 'browser' );
			service.toggle();
			expect( service.mode() ).toBe( 'light' );
		} );

		it( 'should switch to dark when auto and system prefers light', () => {
			const mockMediaQuery = createMockMediaQuery( false );
			( window.matchMedia as ReturnType<typeof vi.fn> ).mockReturnValue( mockMediaQuery );
			service = createService( 'browser' );
			service.toggle();
			expect( service.mode() ).toBe( 'dark' );
		} );
	} );

	describe( 'resetToAuto', () => {
		it( 'should set mode back to auto', () => {
			service = createService( 'browser' );
			service.setTheme( 'dark' );
			service.resetToAuto();
			expect( service.mode() ).toBe( 'auto' );
		} );

		it( 'should persist auto to localStorage', () => {
			service = createService( 'browser' );
			service.resetToAuto();
			expect( setItemSpy ).toHaveBeenCalledWith( 'theme', 'auto' );
		} );
	} );

	describe( 'server platform', () => {
		it( 'should default isDark to false on server', () => {
			service = createService( 'server' );
			expect( service.isDark() ).toBe( false );
		} );

		it( 'should not call localStorage on server', () => {
			setItemSpy.mockClear();
			service = createService( 'server' );
			service.setTheme( 'dark' );
			expect( setItemSpy ).not.toHaveBeenCalledWith( 'theme', 'dark' );
		} );
	} );
} );
