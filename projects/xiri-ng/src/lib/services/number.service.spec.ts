import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriNumberService } from './number.service';

describe( 'XiriNumberService', () => {
	let service: XiriNumberService;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [XiriNumberService],
		} );
		service = TestBed.inject( XiriNumberService );
	} );

	it( 'should be created', () => {
		expect( service ).toBeTruthy();
	} );

	describe( 'setLocale', () => {
		it( 'should change the locale used for formatting', () => {
			service.setLocale( 'en-US' );
			const result = service.formatNumber( 1234.56 );
			expect( result ).toBe( '1,234.56' );
		} );
	} );

	describe( 'formatNumber', () => {
		it( 'should return empty string for null', () => {
			expect( service.formatNumber( null as any ) ).toBe( '' );
		} );

		it( 'should return empty string for undefined', () => {
			expect( service.formatNumber( undefined as any ) ).toBe( '' );
		} );

		it( 'should format number with default locale (de-DE)', () => {
			const result = service.formatNumber( 1234.56 );
			expect( result ).toBe( '1.234,56' );
		} );

		it( 'should format zero', () => {
			expect( service.formatNumber( 0 ) ).toBe( '0' );
		} );

		it( 'should format negative numbers', () => {
			const result = service.formatNumber( -1234.56 );
			expect( result ).toContain( '1.234,56' );
		} );

		describe( 'webformat: integer', () => {
			it( 'should format with no decimal places', () => {
				expect( service.formatNumber( 1234.56, 'integer' ) ).toBe( '1.235' );
			} );

			it( 'should format whole numbers', () => {
				expect( service.formatNumber( 1000, 'integer' ) ).toBe( '1.000' );
			} );
		} );

		describe( 'webformat: float1', () => {
			it( 'should format with 1 decimal place', () => {
				expect( service.formatNumber( 1234.56, 'float1' ) ).toBe( '1.234,6' );
			} );

			it( 'should pad to 1 decimal place', () => {
				expect( service.formatNumber( 5, 'float1' ) ).toBe( '5,0' );
			} );
		} );

		describe( 'webformat: float2', () => {
			it( 'should format with 2 decimal places', () => {
				expect( service.formatNumber( 1234.5, 'float2' ) ).toBe( '1.234,50' );
			} );

			it( 'should round to 2 decimal places', () => {
				expect( service.formatNumber( 1.999, 'float2' ) ).toBe( '2,00' );
			} );
		} );

		describe( 'webformat: float3', () => {
			it( 'should format with 3 decimal places', () => {
				expect( service.formatNumber( 1.1, 'float3' ) ).toBe( '1,100' );
			} );
		} );

		describe( 'webformat: float4', () => {
			it( 'should format with 4 decimal places', () => {
				expect( service.formatNumber( 1.12345, 'float4' ) ).toBe( '1,1235' );
			} );

			it( 'should pad to 4 decimal places', () => {
				expect( service.formatNumber( 0, 'float4' ) ).toBe( '0,0000' );
			} );
		} );

		describe( 'webformat: default / unknown', () => {
			it( 'should use default decimal style for unknown webformat', () => {
				const result = service.formatNumber( 1234.56, 'unknown' );
				expect( result ).toBe( '1.234,56' );
			} );

			it( 'should use default decimal style when webformat is undefined', () => {
				const result = service.formatNumber( 1234.56 );
				expect( result ).toBe( '1.234,56' );
			} );
		} );

		describe( 'with en-US locale', () => {
			beforeEach( () => {
				service.setLocale( 'en-US' );
			} );

			it( 'should format with US decimal separator', () => {
				expect( service.formatNumber( 1234.56, 'float2' ) ).toBe( '1,234.56' );
			} );

			it( 'should format integer with US grouping', () => {
				expect( service.formatNumber( 1000000, 'integer' ) ).toBe( '1,000,000' );
			} );
		} );

		it( 'should handle very large numbers', () => {
			const result = service.formatNumber( 1234567890.12, 'float2' );
			expect( result ).toContain( '1.234.567.890,12' );
		} );

		it( 'should handle very small numbers', () => {
			const result = service.formatNumber( 0.0001, 'float4' );
			expect( result ).toBe( '0,0001' );
		} );
	} );
} );
