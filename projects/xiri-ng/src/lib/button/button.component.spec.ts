import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriButtonComponent, XiriButton, XiriButtonResult } from './button.component';
import { XiriDataService } from '../services/data.service';
import { XiriDownloadService } from '../services/download.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

function makeButton(overrides: Partial<XiriButton> = {}): XiriButton {
	return {
		text: 'Test',
		type: 'raised',
		action: 'link',
		url: '/test',
		...overrides,
	};
}

@Component({
	selector: 'test-host',
	template: `<xiri-button [button]="btn()" [disabled]="disabled()" [filterData]="filterData()" [url]="url()" (result)="onResult($event)" />`,
	imports: [XiriButtonComponent],
})
class TestHostComponent {
	btn = signal<XiriButton>(makeButton());
	disabled = signal(false);
	filterData = signal<any>(undefined);
	url = signal<string>(undefined);
	lastResult: XiriButtonResult | null = null;
	onResult(r: XiriButtonResult) {
		this.lastResult = r;
	}
}

describe('XiriButtonComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let mockDataService: { post: ReturnType<typeof vi.fn>; postFileResponse: ReturnType<typeof vi.fn> };
	let mockDownloadService: { download: ReturnType<typeof vi.fn> };
	let mockDialog: { open: ReturnType<typeof vi.fn> };
	let mockRouter: { navigate: ReturnType<typeof vi.fn>; url: string };
	let mockLocation: { back: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		mockDataService = {
			post: vi.fn().mockReturnValue(of({})),
			postFileResponse: vi.fn().mockReturnValue(of({})),
		};
		mockDownloadService = { download: vi.fn() };
		mockDialog = { open: vi.fn() };
		mockRouter = { navigate: vi.fn().mockReturnValue(Promise.resolve(true)), url: '/current' };
		mockLocation = { back: vi.fn() };

		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
			providers: [
				{ provide: XiriDataService, useValue: mockDataService },
				{ provide: XiriDownloadService, useValue: mockDownloadService },
				{ provide: MatDialog, useValue: mockDialog },
				{ provide: Router, useValue: mockRouter },
				{ provide: Location, useValue: mockLocation },
				{ provide: ActivatedRoute, useValue: {} },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should emit result with done=true for link action', () => {
		host.btn.set(makeButton({ action: 'link' }));
		fixture.detectChanges();

		const el = fixture.nativeElement.querySelector('a');
		el?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
		expect(host.lastResult!.loading).toBe(false);
	});

	it('should emit result with done=true for href action', () => {
		host.btn.set(makeButton({ action: 'href' }));
		fixture.detectChanges();

		const el = fixture.nativeElement.querySelector('a');
		el?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
	});

	it('should emit result with done=false when disabled', () => {
		host.disabled.set(true);
		fixture.detectChanges();

		const el = fixture.nativeElement.querySelector('a');
		el?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(false);
		expect(host.lastResult!.result).toBeNull();
	});

	it('should be disabled when filterData is null', () => {
		host.filterData.set(null);
		fixture.detectChanges();

		const el = fixture.nativeElement.querySelector('a');
		el?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(false);
	});

	it('should be disabled when button.disabled is true', () => {
		host.btn.set(makeButton({ disabled: true }));
		fixture.detectChanges();

		const el = fixture.nativeElement.querySelector('a');
		el?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(false);
	});

	it('should call location.back() for back action', () => {
		host.btn.set(makeButton({ action: 'back' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(mockLocation.back).toHaveBeenCalled();
	});

	it('should emit result with done=true and result=true for debug action', () => {
		host.btn.set(makeButton({ action: 'debug' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
		expect(host.lastResult!.result).toBe(true);
	});

	it('should emit result with done=true and result=true for simulate action', () => {
		host.btn.set(makeButton({ action: 'simulate' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
		expect(host.lastResult!.result).toBe(true);
	});

	it('should call dataService.post for api action', () => {
		host.btn.set(makeButton({ action: 'api', url: '/api-endpoint', data: { key: 'val' } }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(mockDataService.post).toHaveBeenCalledWith('/api-endpoint', { key: 'val' });
	});

	it('should emit loading=true then done=true for api action', () => {
		const results: XiriButtonResult[] = [];
		host.onResult = (r: XiriButtonResult) => {
			results.push(r);
			host.lastResult = r;
		};

		mockDataService.post.mockReturnValue(of({ success: true }));
		host.btn.set(makeButton({ action: 'api', url: '/test' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(results.length).toBe(2);
		expect(results[0].loading).toBe(true);
		expect(results[0].done).toBe(false);
		expect(results[1].loading).toBe(false);
		expect(results[1].done).toBe(true);
	});

	it('should handle api error gracefully', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		mockDataService.post.mockReturnValue(throwError(() => new Error('fail')));
		host.btn.set(makeButton({ action: 'api', url: '/fail' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
		expect(host.lastResult!.result).toBeNull();
		consoleSpy.mockRestore();
	});

	it('should navigate on api result with goto', () => {
		mockDataService.post.mockReturnValue(of({ goto: '/new-page' }));
		host.btn.set(makeButton({ action: 'api', url: '/test' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(mockRouter.navigate).toHaveBeenCalledWith(['/new-page']);
	});

	it('should open dialog for dialog action', () => {
		const afterClosedSubject = new Subject();
		const dialogRefMock = { afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() };
		mockDialog.open.mockReturnValue(dialogRefMock);

		host.btn.set(makeButton({ action: 'dialog', url: '/dialog-url' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(mockDialog.open).toHaveBeenCalled();
	});

	it('should emit result after dialog closes', () => {
		const afterClosedSubject = new Subject();
		const dialogRefMock = { afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() };
		mockDialog.open.mockReturnValue(dialogRefMock);

		host.btn.set(makeButton({ action: 'dialog', url: '/dialog-url' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		afterClosedSubject.next({ some: 'data' });
		afterClosedSubject.complete();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
		expect(host.lastResult!.result).toEqual({ some: 'data' });
	});

	it('should close dialog on destroy', () => {
		const afterClosedSubject = new Subject();
		const dialogRefMock = { afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() };
		mockDialog.open.mockReturnValue(dialogRefMock);

		host.btn.set(makeButton({ action: 'dialog', url: '/dialog-url' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		fixture.destroy();

		expect(dialogRefMock.close).toHaveBeenCalledWith(null);
	});

	it('should use url input over button.url', () => {
		host.btn.set(makeButton({ action: 'link', url: '/button-url' }));
		host.url.set('/override-url');
		fixture.detectChanges();

		const el = fixture.nativeElement.querySelector('a');
		expect(el?.getAttribute('href')).toContain('/override-url');
	});

	it('should call download service for download action', () => {
		const mockResponse = { headers: { get: () => null }, body: new Blob() };
		mockDataService.postFileResponse.mockReturnValue(of(mockResponse));

		host.btn.set(makeButton({ action: 'download', url: '/dl', text: 'Export' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(mockDownloadService.download).toHaveBeenCalled();
	});

	it('should use custom filename for download', () => {
		const mockResponse = { headers: { get: () => null }, body: new Blob() };
		mockDataService.postFileResponse.mockReturnValue(of(mockResponse));

		host.btn.set(makeButton({ action: 'download', url: '/dl', filename: 'custom.xlsx' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(mockDownloadService.download).toHaveBeenCalledWith(mockResponse, 'custom.xlsx', false);
	});

	it('should handle download error gracefully', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		mockDataService.postFileResponse.mockReturnValue(throwError(() => new Error('dl fail')));

		host.btn.set(makeButton({ action: 'download', url: '/dl' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
		expect(host.lastResult!.result).toBeNull();
		consoleSpy.mockRestore();
	});

	it('should log unknown action to console', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		host.btn.set(makeButton({ action: 'unknown-action' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(consoleSpy).toHaveBeenCalledWith('xiri-button unknown action', 'unknown-action');
		consoleSpy.mockRestore();
	});

	it('should merge filterData with button data for api calls', () => {
		mockDataService.post.mockReturnValue(of({}));
		host.btn.set(makeButton({ action: 'api', url: '/test', data: { a: 1 } }));
		host.filterData.set({ b: 2 });
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(mockDataService.post).toHaveBeenCalledWith('/test', { a: 1, b: 2 });
	});

	it('should emit result for close action', () => {
		host.btn.set(makeButton({ action: 'close' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
	});

	it('should emit result for return action', () => {
		host.btn.set(makeButton({ action: 'return' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
	});
});
