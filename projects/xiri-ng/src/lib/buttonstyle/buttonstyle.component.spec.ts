import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriButtonstyleComponent } from './buttonstyle.component';
import { XiriButton } from '../button/button.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

function makeButton(overrides: Partial<XiriButton> = {}): XiriButton {
	return {
		text: 'Click Me',
		type: 'raised',
		action: 'link',
		...overrides,
	};
}

@Component({
	selector: 'test-host',
	template: `<xiri-buttonstyle [button]="btn()" [disabled]="disabled()" [loading]="loading()" />`,
	imports: [XiriButtonstyleComponent],
})
class TestHostComponent {
	btn = signal<XiriButton>(makeButton());
	disabled = signal(false);
	loading = signal(false);
}

describe('XiriButtonstyleComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
		}).compileComponents();
		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should render raised button by default', () => {
		host.btn.set(makeButton({ type: 'raised', text: 'Submit' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-raised-button]');
		expect(btn).toBeTruthy();
		expect(btn?.textContent).toContain('Submit');
	});

	it('should render icon button for type=icon', () => {
		host.btn.set(makeButton({ type: 'icon', icon: 'edit' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-icon-button]');
		expect(btn).toBeTruthy();
	});

	it('should render icontext button with fab extended', () => {
		host.btn.set(makeButton({ type: 'icontext', icon: 'add', text: 'Add' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button.icontext');
		expect(btn).toBeTruthy();
		expect(btn?.textContent).toContain('Add');
	});

	it('should render basic button for type=basic', () => {
		host.btn.set(makeButton({ type: 'basic', text: 'Basic' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-button]');
		expect(btn).toBeTruthy();
	});

	it('should render stroked button for type=stroked', () => {
		host.btn.set(makeButton({ type: 'stroked', text: 'Stroked' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-stroked-button]');
		expect(btn).toBeTruthy();
	});

	it('should render flat button for type=flat', () => {
		host.btn.set(makeButton({ type: 'flat', text: 'Flat' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-flat-button]');
		expect(btn).toBeTruthy();
	});

	it('should render minifab button for type=minifab', () => {
		host.btn.set(makeButton({ type: 'minifab', icon: 'star' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-mini-fab]');
		expect(btn).toBeTruthy();
	});

	it('should render fab button for type=fab', () => {
		host.btn.set(makeButton({ type: 'fab', icon: 'add' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-fab]');
		expect(btn).toBeTruthy();
	});

	it('should disable button when disabled input is true', () => {
		host.btn.set(makeButton({ type: 'raised', text: 'Disabled' }));
		host.disabled.set(true);
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button');
		expect(btn?.disabled).toBe(true);
	});

	it('should disable button when loading is true', () => {
		host.btn.set(makeButton({ type: 'raised', text: 'Loading' }));
		host.loading.set(true);
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button');
		expect(btn?.disabled).toBe(true);
	});

	it('should show spinner when loading for raised type', () => {
		host.btn.set(makeButton({ type: 'raised', text: 'Loading' }));
		host.loading.set(true);
		fixture.detectChanges();

		const spinner = fixture.nativeElement.querySelector('mat-spinner');
		expect(spinner).toBeTruthy();
	});

	it('should show spinner when loading for icon type', () => {
		host.btn.set(makeButton({ type: 'icon', icon: 'edit' }));
		host.loading.set(true);
		fixture.detectChanges();

		const spinner = fixture.nativeElement.querySelector('mat-spinner');
		expect(spinner).toBeTruthy();
	});

	it('should not show spinner when not loading', () => {
		host.btn.set(makeButton({ type: 'raised', text: 'Normal' }));
		host.loading.set(false);
		fixture.detectChanges();

		const spinner = fixture.nativeElement.querySelector('mat-spinner');
		expect(spinner).toBeFalsy();
	});

	it('should render default type with icon as icon button', () => {
		host.btn.set(makeButton({ type: '', icon: 'home' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-icon-button]');
		expect(btn).toBeTruthy();
	});

	it('should render default type with text as raised button', () => {
		host.btn.set(makeButton({ type: '', text: 'Default' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-raised-button]');
		expect(btn).toBeTruthy();
	});

	it('should render nothing for default type with no icon and no text', () => {
		host.btn.set(makeButton({ type: '', icon: undefined, text: undefined }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button');
		expect(btn).toBeFalsy();
	});
});
