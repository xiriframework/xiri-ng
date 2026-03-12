import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriToolbarComponent, XiriToolbarSettings } from './toolbar.component';
import { XiriDataService } from '../services/data.service';
import { XiriDownloadService } from '../services/download.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
	selector: 'test-host',
	template: `<xiri-toolbar [settings]="settings()" [filterData]="filterData()" (searchChanged)="onSearch($event)" />`,
	imports: [XiriToolbarComponent],
})
class TestHostComponent {
	settings = signal<XiriToolbarSettings>({});
	filterData = signal<any>(undefined);
	lastSearch: string | null = null;
	onSearch(value: string) {
		this.lastSearch = value;
	}
}

describe('XiriToolbarComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
			providers: [
				{ provide: XiriDataService, useValue: { post: vi.fn().mockReturnValue(of({})), postFileResponse: vi.fn().mockReturnValue(of({})) } },
				{ provide: XiriDownloadService, useValue: { download: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
				{ provide: Location, useValue: { back: vi.fn() } },
				{ provide: Router, useValue: { navigate: vi.fn(), url: '/' } },
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

	it('should display title when provided', () => {
		host.settings.set({ title: 'My Toolbar' });
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('My Toolbar');
	});

	it('should render icon when provided', () => {
		host.settings.set({ title: 'Test', icon: 'dashboard' });
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector('mat-icon');
		expect(icon).toBeTruthy();
	});

	it('should compute empty search placeholder when search is boolean', () => {
		host.settings.set({ search: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriToolbarComponent;
		expect(comp.searchPlaceholder()).toBe('');
	});

	it('should compute search placeholder from config object', () => {
		host.settings.set({ search: { placeholder: 'Search items...' } });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriToolbarComponent;
		expect(comp.searchPlaceholder()).toBe('Search items...');
	});

	it('should return empty placeholder when search is false', () => {
		host.settings.set({ search: false });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriToolbarComponent;
		expect(comp.searchPlaceholder()).toBe('');
	});

	it('should return empty placeholder when search is undefined', () => {
		host.settings.set({});
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriToolbarComponent;
		expect(comp.searchPlaceholder()).toBe('');
	});

	it('should return empty placeholder when search config has no placeholder', () => {
		host.settings.set({ search: {} });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriToolbarComponent;
		expect(comp.searchPlaceholder()).toBe('');
	});

	it('should update when settings change', () => {
		host.settings.set({ title: 'First' });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('First');

		host.settings.set({ title: 'Second' });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Second');
	});

	it('should handle settings with buttons', () => {
		host.settings.set({
			title: 'With Buttons',
			buttons: {
				buttons: [{ text: 'Add', type: 'raised', action: 'link', url: '/add' }],
				class: 'right',
			},
		});
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('With Buttons');
	});
});
