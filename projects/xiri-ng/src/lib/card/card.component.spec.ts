import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriCardComponent, XiriCardSettings } from './card.component';
import { XiriDataService } from '../services/data.service';
import { XiriDownloadService } from '../services/download.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'test-host',
	template: `<xiri-card [settings]="settings()" />`,
	imports: [XiriCardComponent],
})
class TestHostComponent {
	settings = signal<XiriCardSettings>({});
}

describe('XiriCardComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let mockDataService: { post: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		mockDataService = {
			post: vi.fn().mockReturnValue(of({})),
		};

		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
			providers: [
				{ provide: XiriDataService, useValue: mockDataService },
				{ provide: XiriDownloadService, useValue: { download: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
				{ provide: Location, useValue: { back: vi.fn() } },
				{ provide: Router, useValue: { navigate: vi.fn(), url: '/' } },
				{ provide: ActivatedRoute, useValue: {} },
			],
		}).compileComponents();
		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
	});

	it('should create the component', () => {
		fixture.detectChanges();
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should show static data from settings', () => {
		host.settings.set({
			data: { name: 'Alice', age: '30' },
			header: 'Info',
		});
		fixture.detectChanges();

		const card = fixture.nativeElement.querySelector('mat-card');
		expect(card).toBeTruthy();
	});

	it('should load data from URL on init', () => {
		mockDataService.post.mockReturnValue(of({ data: { a: 'b' } }));
		host.settings.set({ url: 'test/data' });
		fixture.detectChanges();

		expect(mockDataService.post).toHaveBeenCalledWith('test/data', null);
	});

	it('should set loading to true while fetching data', () => {
		const subject = new Subject();
		mockDataService.post.mockReturnValue(subject);

		host.settings.set({ url: 'test/data' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.loading()).toBe(true);

		subject.next({ data: { key: 'val' } });
		subject.complete();
		fixture.detectChanges();

		expect(comp.loading()).toBe(false);
	});

	it('should set error message on fetch failure', () => {
		mockDataService.post.mockReturnValue(throwError(() => ({ error: { error: 'Not found' } })));
		host.settings.set({ url: 'test/fail' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.errorMsg()).toBe('Not found');
		expect(comp.loading()).toBe(false);
	});

	it('should use fallback error message if none provided', () => {
		mockDataService.post.mockReturnValue(throwError(() => ({ error: {} })));
		host.settings.set({ url: 'test/fail' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.errorMsg()).toBe('Fehler beim Laden');
	});

	it('should toggle collapsed state', () => {
		host.settings.set({ header: 'Test', collapsible: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.isCollapsed()).toBe(false);

		comp.toggleCollapse();
		expect(comp.isCollapsed()).toBe(true);

		comp.toggleCollapse();
		expect(comp.isCollapsed()).toBe(false);
	});

	it('should initialize collapsed from settings', () => {
		host.settings.set({ header: 'Test', collapsible: true, collapsed: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.isCollapsed()).toBe(true);
	});

	it('should compute cardData from loaded data', () => {
		mockDataService.post.mockReturnValue(of({ data: { name: 'Alice' } }));
		host.settings.set({ url: 'test/data' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.cardData()).toEqual({ name: 'Alice' });
	});

	it('should fallback to settings.data when no URL data loaded', () => {
		host.settings.set({ data: { key: 'value' } });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.cardData()).toEqual({ key: 'value' });
	});

	it('should compute rawTable with auto-generated fields for object data', () => {
		host.settings.set({ data: { name: 'Alice', age: '30' } });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		const rt = comp.rawTable();
		expect(rt).toBeTruthy();
		expect(rt!.fields).toBeTruthy();
		expect(rt!.fields!.length).toBe(2);
		expect(rt!.data).toEqual([
			{ f0: 'name', f1: 'Alice' },
			{ f0: 'age', f1: '30' },
		]);
	});

	it('should compute rawTable with auto-generated fields for array data', () => {
		host.settings.set({ data: [['Name', 'Alice']] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		const rt = comp.rawTable();
		expect(rt).toBeTruthy();
		expect(rt!.fields!.length).toBe(2);
		expect(rt!.fields![0].id).toBe('0');
		expect(rt!.fields![1].id).toBe('1');
	});

	it('should return null rawTable when cardData is null', () => {
		host.settings.set({});
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.rawTable()).toBeNull();
	});

	it('should use provided fields when available', () => {
		const fields = [
			{ id: 'a', name: 'a', format: 'text', display: 'info', minWidth: '30px' },
		];
		host.settings.set({ data: [{ a: 'hello' }], fields });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		const rt = comp.rawTable();
		expect(rt!.fields).toBe(fields);
	});

	it('should not reload while already loading', () => {
		const subject = new Subject();
		mockDataService.post.mockReturnValue(subject);

		host.settings.set({ url: 'test/data' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.loading()).toBe(true);

		comp.reload();
		expect(mockDataService.post).toHaveBeenCalledTimes(1);
	});

	it('should render header when provided', () => {
		host.settings.set({ header: 'Card Title', data: { a: 'b' } });
		fixture.detectChanges();

		const title = fixture.nativeElement.querySelector('mat-card-title');
		expect(title?.textContent).toContain('Card Title');
	});

	it('should render collapse button when collapsible', () => {
		host.settings.set({ header: 'Test', collapsible: true, data: { a: 'b' } });
		fixture.detectChanges();

		const collapseBtn = fixture.nativeElement.querySelector('.collapse-btn');
		expect(collapseBtn).toBeTruthy();
	});

	it('should show error message in DOM on load failure', () => {
		mockDataService.post.mockReturnValue(throwError(() => ({ error: { error: 'Server error' } })));
		host.settings.set({ url: 'fail' });
		fixture.detectChanges();

		const errorDiv = fixture.nativeElement.querySelector('.load-error');
		expect(errorDiv?.textContent).toContain('Server error');
	});
});
