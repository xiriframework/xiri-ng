import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriLinksComponent, XiriLinksSettings } from './links.component';
import { XiriButton } from '../button/button.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

function makeLink(overrides: Partial<XiriButton> = {}): XiriButton {
	return {
		text: 'Link',
		type: 'raised',
		action: 'dialog',
		url: '/dialog-url',
		icon: 'open_in_new',
		...overrides,
	};
}

@Component({
	selector: 'test-host',
	template: `<xiri-links [settings]="settings()" />`,
	imports: [XiriLinksComponent],
})
class TestHostComponent {
	settings = signal<XiriLinksSettings>({ data: [] });
}

describe('XiriLinksComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let mockDialog: { open: ReturnType<typeof vi.fn> };
	let mockRouter: { navigate: ReturnType<typeof vi.fn>; url: string };

	beforeEach(async () => {
		mockDialog = { open: vi.fn() };
		mockRouter = { navigate: vi.fn().mockReturnValue(Promise.resolve(true)), url: '/current' };

		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
			providers: [
				{ provide: MatDialog, useValue: mockDialog },
				{ provide: Router, useValue: mockRouter },
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

	it('should render with empty data array', () => {
		host.settings.set({ data: [] });
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('mat-card')).toBeTruthy();
	});

	it('should render links for each item', () => {
		host.settings.set({
			data: [makeLink({ text: 'Link A' }), makeLink({ text: 'Link B' })],
		});
		fixture.detectChanges();

		const text = fixture.nativeElement.textContent;
		expect(text).toContain('Link A');
		expect(text).toContain('Link B');
	});

	it('should display header when provided', () => {
		host.settings.set({ data: [], header: 'Quick Links' });
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('Quick Links');
	});

	it('should display headerSub when provided', () => {
		host.settings.set({ data: [], header: 'Links', headerSub: 'Subtitle' });
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('Subtitle');
	});

	it('should open dialog when openDialog is called', () => {
		const afterClosedSubject = new Subject();
		const dialogRefMock = { afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() };
		mockDialog.open.mockReturnValue(dialogRefMock);

		const comp = fixture.debugElement.children[0].componentInstance as XiriLinksComponent;
		const result = comp.openDialog(makeLink({ url: '/test-dialog' }));

		expect(result).toBe(true);
		expect(mockDialog.open).toHaveBeenCalled();
		const callArgs = mockDialog.open.mock.calls[0];
		expect(callArgs[1].data).toEqual({ type: 'load', url: '/test-dialog' });
	});

	it('should navigate on dialog close with page refresh', () => {
		const afterClosedSubject = new Subject();
		const dialogRefMock = { afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() };
		mockDialog.open.mockReturnValue(dialogRefMock);

		const comp = fixture.debugElement.children[0].componentInstance as XiriLinksComponent;
		comp.openDialog(makeLink());

		afterClosedSubject.next({ page: 'refresh' });
		afterClosedSubject.complete();

		expect(mockRouter.navigate).toHaveBeenCalledWith(['/current']);
	});

	it('should navigate on dialog close with refresh page', () => {
		const afterClosedSubject = new Subject();
		const dialogRefMock = { afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() };
		mockDialog.open.mockReturnValue(dialogRefMock);

		const comp = fixture.debugElement.children[0].componentInstance as XiriLinksComponent;
		comp.openDialog(makeLink());

		afterClosedSubject.next({ refresh: 'page' });
		afterClosedSubject.complete();

		expect(mockRouter.navigate).toHaveBeenCalledWith(['/current']);
	});

	it('should not navigate on dialog close with null result', () => {
		const afterClosedSubject = new Subject();
		const dialogRefMock = { afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() };
		mockDialog.open.mockReturnValue(dialogRefMock);

		const comp = fixture.debugElement.children[0].componentInstance as XiriLinksComponent;
		comp.openDialog(makeLink());

		afterClosedSubject.next(null);
		afterClosedSubject.complete();

		expect(mockRouter.navigate).not.toHaveBeenCalled();
	});

	it('should close dialog on destroy', () => {
		const afterClosedSubject = new Subject();
		const dialogRefMock = { afterClosed: () => afterClosedSubject.asObservable(), close: vi.fn() };
		mockDialog.open.mockReturnValue(dialogRefMock);

		const comp = fixture.debugElement.children[0].componentInstance as XiriLinksComponent;
		comp.openDialog(makeLink());

		fixture.destroy();

		expect(dialogRefMock.close).toHaveBeenCalledWith(null);
	});

	it('should not throw on destroy without open dialog', () => {
		expect(() => fixture.destroy()).not.toThrow();
	});

	it('should render header icon when provided', () => {
		host.settings.set({ data: [], header: 'Links', headerIcon: 'link' });
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector('mat-icon');
		expect(icon).toBeTruthy();
	});

	it('should update when settings change', () => {
		host.settings.set({ data: [makeLink({ text: 'First' })] });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('First');

		host.settings.set({ data: [makeLink({ text: 'Second' })] });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Second');
	});
});
