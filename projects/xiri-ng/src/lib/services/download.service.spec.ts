import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriDownloadService } from './download.service';

describe( 'XiriDownloadService', () => {
	let service: XiriDownloadService;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [XiriDownloadService],
		} );
		service = TestBed.inject( XiriDownloadService );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'should be created', () => {
		expect( service ).toBeTruthy();
	} );

	describe( 'download', () => {
		const createMockResult = ( contentType: string, contentDisposition?: string ) => {
			const headers = new Map<string, string>();
			headers.set( 'content-type', contentType );
			if ( contentDisposition ) {
				headers.set( 'content-disposition', contentDisposition );
			}
			return {
				headers: {
					get: ( key: string ) => headers.get( key ) || null,
				},
				body: new Blob( ['test content'], { type: contentType } ),
			};
		};

		it( 'should use filename from content-disposition header when present', () => {
			const result = createMockResult( 'text/csv', 'attachment; filename="report.csv"' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as any );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => {} );

			service.download( result, 'original.csv', false );

			expect( mockAnchor.download ).toBe( 'report.csv' );
		} );

		it( 'should strip quotes from content-disposition filename', () => {
			const result = createMockResult( 'text/csv', 'attachment; filename="quoted.csv"' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as any );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => {} );

			service.download( result, 'fallback.csv', false );

			expect( mockAnchor.download ).toBe( 'quoted.csv' );
		} );

		it( 'should use provided filename when no content-disposition', () => {
			const result = createMockResult( 'application/pdf' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as any );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => {} );

			service.download( result, 'myfile.pdf', false );

			expect( mockAnchor.download ).toBe( 'myfile.pdf' );
		} );

		it( 'should open in new window when open is true', () => {
			const result = createMockResult( 'application/pdf' );
			const mockWindow = {} as Window;
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( window, 'open' ).mockReturnValue( mockWindow );

			const ret = service.download( result, 'file.pdf', true );

			expect( window.open ).toHaveBeenCalledWith( 'blob:test', '_blank' );
			expect( ret ).toBe( true );
		} );

		it( 'should return false when window.open returns null (popup blocked)', () => {
			const result = createMockResult( 'application/pdf' );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( window, 'open' ).mockReturnValue( null );

			const ret = service.download( result, 'file.pdf', true );

			expect( ret ).toBe( false );
		} );

		it( 'should return false when window.open returns undefined (popup blocked)', () => {
			const result = createMockResult( 'application/pdf' );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( window, 'open' ).mockReturnValue( undefined as any );

			const ret = service.download( result, 'file.pdf', true );

			expect( ret ).toBe( false );
		} );

		it( 'should create anchor element for download when open is false', () => {
			const result = createMockResult( 'text/csv' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as any );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => {} );

			const ret = service.download( result, 'data.csv', false );

			expect( document.createElementNS ).toHaveBeenCalledWith( 'http://www.w3.org/1999/xhtml', 'a' );
			expect( mockAnchor.rel ).toBe( 'noopener' );
			expect( mockAnchor.href ).toBe( 'blob:test' );
			expect( ret ).toBe( true );
		} );

		it( 'should revoke object URL after timeout', () => {
			vi.useFakeTimers();
			const result = createMockResult( 'text/csv' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as any );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test-revoke' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => {} );

			service.download( result, 'data.csv', false );

			expect( URL.revokeObjectURL ).not.toHaveBeenCalled();

			vi.advanceTimersByTime( 2000 );

			expect( URL.revokeObjectURL ).toHaveBeenCalledWith( 'blob:test-revoke' );

			vi.useRealTimers();
		} );

		it( 'should trigger click on anchor after timeout', () => {
			vi.useFakeTimers();
			const result = createMockResult( 'text/csv' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as any );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => {} );

			service.download( result, 'data.csv', false );

			expect( mockAnchor.click ).not.toHaveBeenCalled();

			vi.advanceTimersByTime( 0 );

			expect( mockAnchor.click ).toHaveBeenCalled();

			vi.useRealTimers();
		} );
	} );
} );
