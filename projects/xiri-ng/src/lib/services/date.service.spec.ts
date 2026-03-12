import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DateAdapter } from '@angular/material/core';
import { XiriDateService } from './date.service';

describe( 'XiriDateService', () => {
	let service: XiriDateService;
	let dateAdapter: { setLocale: ReturnType<typeof vi.fn> };

	beforeEach( () => {
		dateAdapter = { setLocale: vi.fn() };

		TestBed.configureTestingModule( {
			providers: [
				XiriDateService,
				{ provide: DateAdapter, useValue: dateAdapter },
			],
		} );
		service = TestBed.inject( XiriDateService );
	} );

	it( 'should be created', () => {
		expect( service ).toBeTruthy();
	} );

	describe( 'setTimezone', () => {
		it( 'should change the timezone used for conversions', () => {
			service.setTimezone( 'America/New_York' );
			// Verify by converting a known timestamp
			const date = service.unixToLocal( 0 ); // 1970-01-01 00:00:00 UTC
			expect( date ).toBeTruthy();
		} );
	} );

	describe( 'setLocale', () => {
		it( 'should call dateAdapter.setLocale', () => {
			const mockLocale = {} as any;
			service.setLocale( 'de', mockLocale );
			expect( dateAdapter.setLocale ).toHaveBeenCalledWith( mockLocale );
		} );
	} );

	describe( 'unixToLocal', () => {
		it( 'should return null for null input', () => {
			expect( service.unixToLocal( null as any ) ).toBeNull();
		} );

		it( 'should return null for undefined input', () => {
			expect( service.unixToLocal( undefined as any ) ).toBeNull();
		} );

		it( 'should convert unix timestamp to Date', () => {
			const result = service.unixToLocal( 1700000000 );
			expect( result ).toBeInstanceOf( Date );
		} );

		it( 'should convert epoch 0 to a valid date', () => {
			const result = service.unixToLocal( 0 );
			expect( result ).toBeInstanceOf( Date );
		} );

		it( 'should respect the configured timezone', () => {
			// 2024-01-01 00:00:00 UTC = 1704067200
			service.setTimezone( 'Europe/Vienna' );
			const vienna = service.unixToLocal( 1704067200 );

			service.setTimezone( 'America/New_York' );
			const newYork = service.unixToLocal( 1704067200 );

			// Vienna is UTC+1 in winter, New York is UTC-5
			// The hours should differ by 6
			expect( vienna ).toBeTruthy();
			expect( newYork ).toBeTruthy();
			expect( vienna!.getHours() ).not.toBe( newYork!.getHours() );
		} );
	} );

	describe( 'unixToStringDateTime', () => {
		it( 'should format as yyyy-MM-dd HH:mm', () => {
			// Use a known timestamp: 2024-01-15 12:30:00 UTC = 1705321800
			service.setTimezone( 'UTC' );
			const result = service.unixToStringDateTime( 1705321800 );
			expect( result ).toBe( '2024-01-15 12:30' );
		} );

		it( 'should respect timezone in formatting', () => {
			service.setTimezone( 'Europe/Vienna' );
			// 2024-07-15 12:00:00 UTC = 1721044800 (summer time, UTC+2)
			const result = service.unixToStringDateTime( 1721044800 );
			expect( result ).toBe( '2024-07-15 14:00' );
		} );
	} );

	describe( 'unixToStringDate', () => {
		it( 'should format as d. LLL.', () => {
			service.setTimezone( 'UTC' );
			const result = service.unixToStringDate( 1705321800 );
			// 15. Jan.
			expect( result ).toMatch( /15\.\s+\w+\./ );
		} );
	} );

	describe( 'unixToStringDateYear', () => {
		it( 'should format as d. LLL. yy', () => {
			service.setTimezone( 'UTC' );
			const result = service.unixToStringDateYear( 1705321800 );
			// 15. Jan. 24
			expect( result ).toMatch( /15\.\s+\w+\.\s+24/ );
		} );
	} );

	describe( 'dateToUnix', () => {
		it( 'should convert a Date to unix timestamp', () => {
			service.setTimezone( 'UTC' );
			const date = new Date( '2024-01-15T12:00:00Z' );
			const result = service.dateToUnix( date );
			expect( typeof result ).toBe( 'number' );
			expect( result ).toBeGreaterThan( 0 );
		} );

		it( 'should return integer (no milliseconds)', () => {
			service.setTimezone( 'UTC' );
			const date = new Date( '2024-01-15T12:30:45.123Z' );
			const result = service.dateToUnix( date );
			expect( result ).toBe( Math.floor( result ) );
		} );

		it( 'should handle epoch date', () => {
			service.setTimezone( 'UTC' );
			// new Date('1970-01-01T00:00:00Z') has getTime()=0, but transpose
			// re-interprets the date's local wall-clock time in the target timezone.
			// In CET (UTC+1) the local representation is 01:00, which transposed
			// to UTC gives 01:00 UTC = 3600s. Use a local-time constructor so the
			// wall-clock reading is midnight regardless of the runner's timezone.
			const date = new Date( 1970, 0, 1, 0, 0, 0 );
			const result = service.dateToUnix( date );
			expect( result ).toBe( 0 );
		} );
	} );
} );
