import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
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

	describe( 'openTab', () => {

		it( 'should open an empty tab and return the handle', () => {
			const mockWindow = {} as Window;
			vi.spyOn( window, 'open' ).mockReturnValue( mockWindow );

			const tab = service.openTab();

			expect( window.open ).toHaveBeenCalledWith( 'about:blank', '_blank' );
			expect( tab ).toBe( mockWindow );
		} );

		it( 'should return null when the popup is blocked', () => {
			vi.spyOn( window, 'open' ).mockReturnValue( null );

			expect( service.openTab() ).toBeNull();
		} );
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
			} as unknown as HttpResponse<Blob>;
		};

		it( 'should use filename from content-disposition header when present', () => {
			const result = createMockResult( 'text/csv', 'attachment; filename="report.csv"' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as unknown as HTMLElement );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => { /* intentionally empty */ } );

			service.download( result, 'original.csv', null );

			expect( mockAnchor.download ).toBe( 'report.csv' );
		} );

		it( 'should strip quotes from content-disposition filename', () => {
			const result = createMockResult( 'text/csv', 'attachment; filename="quoted.csv"' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as unknown as HTMLElement );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => { /* intentionally empty */ } );

			service.download( result, 'fallback.csv', null );

			expect( mockAnchor.download ).toBe( 'quoted.csv' );
		} );

		it( 'should use provided filename when no content-disposition', () => {
			const result = createMockResult( 'application/pdf' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as unknown as HTMLElement );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => { /* intentionally empty */ } );

			service.download( result, 'myfile.pdf', null );

			expect( mockAnchor.download ).toBe( 'myfile.pdf' );
		} );

		// A tab handle as handed out by openTab() and passed back into download().
		const createMockTab = () => ( {
			opener: {} as unknown,
			location: { replace: vi.fn() },
			close: vi.fn(),
		} );

		it( 'should navigate the given tab to the blob url instead of downloading', () => {
			const result = createMockResult( 'application/pdf' );
			const tab = createMockTab();
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( document, 'createElementNS' );

			const ret = service.download( result, 'file.pdf', tab as unknown as Window );

			expect( tab.location.replace ).toHaveBeenCalledWith( 'blob:test' );
			expect( document.createElementNS ).not.toHaveBeenCalled();
			expect( ret ).toBe( true );
		} );

		it( 'should detach the opener of the given tab', () => {
			const result = createMockResult( 'application/pdf' );
			const tab = createMockTab();
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );

			service.download( result, 'file.pdf', tab as unknown as Window );

			expect( tab.opener ).toBeNull();
		} );

		it( 'should revoke the object URL of a tab download after 60s', () => {
			vi.useFakeTimers();
			const result = createMockResult( 'application/pdf' );
			const tab = createMockTab();
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test-tab' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => { /* intentionally empty */ } );

			service.download( result, 'file.pdf', tab as unknown as Window );

			vi.advanceTimersByTime( 59_000 );
			expect( URL.revokeObjectURL ).not.toHaveBeenCalled();

			vi.advanceTimersByTime( 1_000 );
			expect( URL.revokeObjectURL ).toHaveBeenCalledWith( 'blob:test-tab' );

			vi.useRealTimers();
		} );

		it( 'should fall back to the anchor download when no tab is given', () => {
			const result = createMockResult( 'application/pdf' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as unknown as HTMLElement );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => { /* intentionally empty */ } );

			const ret = service.download( result, 'file.pdf', null );

			expect( mockAnchor.href ).toBe( 'blob:test' );
			expect( ret ).toBe( true );
		} );

		it( 'should create anchor element for download when no tab is given', () => {
			const result = createMockResult( 'text/csv' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as unknown as HTMLElement );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => { /* intentionally empty */ } );

			const ret = service.download( result, 'data.csv', null );

			expect( document.createElementNS ).toHaveBeenCalledWith( 'http://www.w3.org/1999/xhtml', 'a' );
			expect( mockAnchor.rel ).toBe( 'noopener' );
			expect( mockAnchor.href ).toBe( 'blob:test' );
			expect( ret ).toBe( true );
		} );

		it( 'should revoke object URL after timeout', () => {
			vi.useFakeTimers();
			const result = createMockResult( 'text/csv' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as unknown as HTMLElement );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test-revoke' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => { /* intentionally empty */ } );

			service.download( result, 'data.csv', null );

			expect( URL.revokeObjectURL ).not.toHaveBeenCalled();

			vi.advanceTimersByTime( 2000 );

			expect( URL.revokeObjectURL ).toHaveBeenCalledWith( 'blob:test-revoke' );

			vi.useRealTimers();
		} );

		it( 'should trigger click on anchor after timeout', () => {
			vi.useFakeTimers();
			const result = createMockResult( 'text/csv' );
			const mockAnchor = { download: '', rel: '', href: '', click: vi.fn() };
			vi.spyOn( document, 'createElementNS' ).mockReturnValue( mockAnchor as unknown as HTMLElement );
			vi.spyOn( URL, 'createObjectURL' ).mockReturnValue( 'blob:test' );
			vi.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => { /* intentionally empty */ } );

			service.download( result, 'data.csv', null );

			expect( mockAnchor.click ).not.toHaveBeenCalled();

			vi.advanceTimersByTime( 0 );

			expect( mockAnchor.click ).toHaveBeenCalled();

			vi.useRealTimers();
		} );
	} );
} );
