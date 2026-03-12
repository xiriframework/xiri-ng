import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriButtonlineComponent, XiriButtonlineSettings } from './buttonline.component';
import { XiriButton, XiriButtonResult } from '../button/button.component';
import { XiriDataService } from '../services/data.service';
import { XiriDownloadService } from '../services/download.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
	template: `<xiri-buttonline [settings]="settings()" [disabled]="disabled()" [filterData]="filterData()" (result)="onResult($event)" />`,
	imports: [XiriButtonlineComponent],
})
class TestHostComponent {
	settings = signal<XiriButtonlineSettings>({ buttons: [], class: '' });
	disabled = signal(false);
	filterData = signal<any>(undefined);
	lastResult: XiriButtonResult | null = null;
	onResult(r: XiriButtonResult) {
		this.lastResult = r;
	}
}

describe('XiriButtonlineComponent', () => {
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

	it('should render no buttons when array is empty', () => {
		host.settings.set({ buttons: [], class: '' });
		fixture.detectChanges();

		const buttons = fixture.nativeElement.querySelectorAll('xiri-button');
		expect(buttons.length).toBe(0);
	});

	it('should render buttons for each item in the array', () => {
		host.settings.set({
			buttons: [
				makeButton({ text: 'A' }),
				makeButton({ text: 'B' }),
				makeButton({ text: 'C' }),
			],
			class: '',
		});
		fixture.detectChanges();

		const buttons = fixture.nativeElement.querySelectorAll('xiri-button');
		expect(buttons.length).toBe(3);
	});

	it('should apply CSS class from settings', () => {
		host.settings.set({ buttons: [makeButton()], class: 'right' });
		fixture.detectChanges();

		const div = fixture.nativeElement.querySelector('.buttonline');
		expect(div?.classList.contains('right')).toBe(true);
	});

	it('should emit result when a child button emits', () => {
		host.settings.set({
			buttons: [makeButton({ action: 'close', type: 'raised', text: 'Close' })],
			class: '',
		});
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('xiri-buttonstyle');
		btn?.click();

		expect(host.lastResult).toBeTruthy();
		expect(host.lastResult!.done).toBe(true);
	});

	it('should update when settings signal changes', () => {
		host.settings.set({ buttons: [makeButton()], class: '' });
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelectorAll('xiri-button').length).toBe(1);

		host.settings.set({
			buttons: [makeButton(), makeButton({ text: 'B' }), makeButton({ text: 'C' }), makeButton({ text: 'D' })],
			class: '',
		});
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelectorAll('xiri-button').length).toBe(4);
	});
});
