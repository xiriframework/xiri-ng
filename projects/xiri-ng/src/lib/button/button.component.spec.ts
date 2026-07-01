import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { XiriButtonComponent, XiriButton, XiriButtonResult, XiriButtonResponse } from './button.component';
import { XiriDataService } from '../services/data.service';
import { XiriDownloadService } from '../services/download.service';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

type AfterClosedSubject = Subject<XiriButtonResponse | Record<string, unknown> | null>;

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
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [XiriButtonComponent],
})
class TestHostComponent {
	btn = signal<XiriButton>(makeButton());
	disabled = signal(false);
	filterData = signal<Record<string, unknown> | null | undefined>(undefined);
	url = signal<string | undefined>(undefined);
	lastResult: XiriButtonResult | null = null;
	onResult(r: XiriButtonResult) {
		this.lastResult = r;
	}
}

describe('XiriButtonComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let mockDataService: { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; postFileResponse: ReturnType<typeof vi.fn> };
	let mockDownloadService: { download: ReturnType<typeof vi.fn> };
	let mockDialog: { open: ReturnType<typeof vi.fn> };
	let mockRouter: { navigate: ReturnType<typeof vi.fn>; url: string };
	let mockLocation: { back: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		mockDataService = {
			post: vi.fn().mockReturnValue(of({})),
			get: vi.fn().mockReturnValue(of({})),
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
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { /* intentionally empty */ });
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
		const afterClosedSubject: AfterClosedSubject = new Subject();
		const dialogRefMock = { afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() };
		mockDialog.open.mockReturnValue(dialogRefMock);

		host.btn.set(makeButton({ action: 'dialog', url: '/dialog-url' }));
		fixture.detectChanges();

		const buttonEl = fixture.nativeElement.querySelector('xiri-buttonstyle');
		buttonEl?.click();

		expect(mockDialog.open).toHaveBeenCalled();
	});

	it('should emit result after dialog closes', () => {
		const afterClosedSubject: AfterClosedSubject = new Subject();
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
		const afterClosedSubject: AfterClosedSubject = new Subject();
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
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { /* intentionally empty */ });
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
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { /* intentionally empty */ });
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

	describe('self-polling', () => {
		afterEach(() => {
			vi.useRealTimers();
		});

		it('should start polling when api response contains poll', () => {
			vi.useFakeTimers();
			mockDataService.post.mockReturnValue(of({ done: true, poll: 2000, pollUrl: '/status' }));
			mockDataService.get.mockReturnValue(of({ done: true, poll: 2000, pollUrl: '/status' }));
			host.btn.set(makeButton({ action: 'api', url: '/start' }));
			fixture.detectChanges();

			fixture.nativeElement.querySelector('xiri-buttonstyle')?.click();

			// While polling no "done" emit yet (only the initial loading emit)
			expect(host.lastResult!.done).toBe(false);

			vi.advanceTimersByTime(2000);
			expect(mockDataService.get).toHaveBeenCalledWith('/status');
		});

		it('should fall back to button.url when pollUrl is missing', () => {
			vi.useFakeTimers();
			mockDataService.post.mockReturnValue(of({ done: true, poll: 1000 }));
			mockDataService.get.mockReturnValue(of({ done: true }));
			host.btn.set(makeButton({ action: 'api', url: '/start' }));
			fixture.detectChanges();

			fixture.nativeElement.querySelector('xiri-buttonstyle')?.click();
			vi.advanceTimersByTime(1000);

			expect(mockDataService.get).toHaveBeenCalledWith('/start');
		});

		it('should stop polling and handle the final response without poll', () => {
			vi.useFakeTimers();
			mockDataService.post.mockReturnValue(of({ done: true, poll: 2000, pollUrl: '/status' }));
			mockDataService.get.mockReturnValue(of({ done: true, goto: '/done-page' }));
			host.btn.set(makeButton({ action: 'api', url: '/start' }));
			fixture.detectChanges();

			fixture.nativeElement.querySelector('xiri-buttonstyle')?.click();
			vi.advanceTimersByTime(2000);

			expect(mockRouter.navigate).toHaveBeenCalledWith(['/done-page']);
			expect(host.lastResult!.done).toBe(true);

			const calls = mockDataService.get.mock.calls.length;
			vi.advanceTimersByTime(5000);
			expect(mockDataService.get.mock.calls.length).toBe(calls);
		});

		it('should start polling when a dialog result contains poll', () => {
			vi.useFakeTimers();
			const afterClosedSubject: AfterClosedSubject = new Subject();
			mockDialog.open.mockReturnValue({ afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() });
			mockDataService.get.mockReturnValue(of({ done: true }));
			host.btn.set(makeButton({ action: 'dialog', url: '/dlg' }));
			fixture.detectChanges();

			fixture.nativeElement.querySelector('xiri-buttonstyle')?.click();
			afterClosedSubject.next({ done: true, poll: 2000, pollUrl: '/status' });

			vi.advanceTimersByTime(2000);
			expect(mockDataService.get).toHaveBeenCalledWith('/status');
		});

		it('should show backend-defined poll text in the button', () => {
			vi.useFakeTimers();
			mockDataService.post.mockReturnValue(of({ done: true, poll: 2000, pollUrl: '/status', text: 'läuft… 50 %' }));
			mockDataService.get.mockReturnValue(of({ done: true }));
			host.btn.set(makeButton({ action: 'api', url: '/start' }));
			fixture.detectChanges();

			fixture.nativeElement.querySelector('xiri-buttonstyle')?.click();
			fixture.detectChanges();

			const text = fixture.nativeElement.querySelector('.poll-countdown')?.textContent?.trim();
			expect(text).toBe('läuft… 50 %');
		});

		it('should stop polling on destroy', () => {
			vi.useFakeTimers();
			mockDataService.post.mockReturnValue(of({ done: true, poll: 2000, pollUrl: '/status' }));
			mockDataService.get.mockReturnValue(of({ done: true, poll: 2000, pollUrl: '/status' }));
			host.btn.set(makeButton({ action: 'api', url: '/start' }));
			fixture.detectChanges();

			fixture.nativeElement.querySelector('xiri-buttonstyle')?.click();
			fixture.destroy();

			const calls = mockDataService.get.mock.calls.length;
			vi.advanceTimersByTime(5000);
			expect(mockDataService.get.mock.calls.length).toBe(calls);
		});
	});

	describe('button patch', () => {
		it('should apply a backend button patch (text + disabled) from the response', () => {
			mockDataService.post.mockReturnValue(of({ done: true, button: { text: 'Erledigt', color: 'success', disabled: true } }));
			host.btn.set(makeButton({ action: 'api', url: '/start', text: 'Start' }));
			fixture.detectChanges();

			fixture.nativeElement.querySelector('xiri-buttonstyle')?.click();
			fixture.detectChanges();

			const btnEl = fixture.nativeElement.querySelector('xiri-buttonstyle button');
			expect(btnEl?.textContent?.trim()).toContain('Erledigt');
			expect(btnEl?.disabled).toBe(true);
		});

		it('should reset the button patch when the action is triggered again', () => {
			mockDataService.post.mockReturnValueOnce(of({ done: true, button: { text: 'Erledigt', color: 'success' } }));
			host.btn.set(makeButton({ action: 'api', url: '/start', text: 'Start' }));
			fixture.detectChanges();

			fixture.nativeElement.querySelector('xiri-buttonstyle')?.click();
			fixture.detectChanges();
			expect(fixture.nativeElement.querySelector('xiri-buttonstyle button')?.textContent?.trim()).toContain('Erledigt');

			// next call returns nothing special → override cleared, original label restored
			mockDataService.post.mockReturnValue(of({ done: true }));
			fixture.nativeElement.querySelector('xiri-buttonstyle button')?.click();
			fixture.detectChanges();
			expect(fixture.nativeElement.querySelector('xiri-buttonstyle button')?.textContent?.trim()).toContain('Start');
		});
	});

	describe('auto-load', () => {
		it('should auto-trigger the api action once on load when autoLoad is true', () => {
			mockDataService.post.mockReturnValue(of({}));
			host.filterData.set({ x: 1 });
			host.btn.set(makeButton({ action: 'api', url: '/auto', autoLoad: true }));
			fixture.detectChanges();

			expect(mockDataService.post).toHaveBeenCalledTimes(1);
			expect(mockDataService.post).toHaveBeenCalledWith('/auto', { x: 1 });
		});

		it('should not auto-trigger when autoLoad is not set', () => {
			mockDataService.post.mockReturnValue(of({}));
			host.filterData.set({ x: 1 });
			host.btn.set(makeButton({ action: 'api', url: '/manual' }));
			fixture.detectChanges();

			expect(mockDataService.post).not.toHaveBeenCalled();
		});

		it('should auto-trigger only once even when filterData changes afterwards', () => {
			mockDataService.post.mockReturnValue(of({}));
			host.filterData.set({ x: 1 });
			host.btn.set(makeButton({ action: 'api', url: '/auto', autoLoad: true }));
			fixture.detectChanges();

			host.filterData.set({ x: 2 });
			fixture.detectChanges();
			host.filterData.set({ x: 3 });
			fixture.detectChanges();

			expect(mockDataService.post).toHaveBeenCalledTimes(1);
		});

		it('should defer auto-trigger while disabled (filterData null) and fire once enabled', () => {
			mockDataService.post.mockReturnValue(of({}));
			host.filterData.set(null);
			host.btn.set(makeButton({ action: 'api', url: '/auto', autoLoad: true }));
			fixture.detectChanges();

			expect(mockDataService.post).not.toHaveBeenCalled();

			host.filterData.set({ x: 1 });
			fixture.detectChanges();

			expect(mockDataService.post).toHaveBeenCalledTimes(1);
			expect(mockDataService.post).toHaveBeenCalledWith('/auto', { x: 1 });
		});
	});
});
