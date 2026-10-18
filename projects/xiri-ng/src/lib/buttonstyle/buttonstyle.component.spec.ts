import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriButtonstyleComponent } from './buttonstyle.component';
import { XiriButton } from '../button/button.component';

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
	// (click) on the host like every consumer (form, dialog, stepper, alert, table, xiri-button).
	template: `<xiri-buttonstyle [button]="btn()" [disabled]="disabled()" [loading]="loading()" (click)="clicks = clicks + 1" />`,
	imports: [XiriButtonstyleComponent],
})
class TestHostComponent {
	btn = signal<XiriButton>(makeButton());
	disabled = signal(false);
	loading = signal(false);
	clicks = 0;
}

describe('XiriButtonstyleComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
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

	it('should set aria-label on icon-only button from hint', () => {
		host.btn.set(makeButton({ type: 'icon', icon: 'edit', hint: 'Bearbeiten', text: undefined }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-icon-button]');
		expect(btn?.getAttribute('aria-label')).toBe('Bearbeiten');
	});

	it('should fall back to text for aria-label when no hint on icon-only button', () => {
		host.btn.set(makeButton({ type: 'icon', icon: 'delete', hint: undefined, text: 'Löschen' }));
		fixture.detectChanges();

		const btn = fixture.nativeElement.querySelector('button[mat-icon-button]');
		expect(btn?.getAttribute('aria-label')).toBe('Löschen');
	});

	// The guard lives here, not only in xiri-button: form, dialog, alert and
	// stepper render XiriButton through buttonstyle directly, so a guard further
	// up would leave hide dead in all of them.
	describe('hide', () => {
		it('renders nothing for a hidden button', () => {
			host.btn.set(makeButton({ type: 'raised', text: 'Weg', hide: true }));
			fixture.detectChanges();

			expect(fixture.nativeElement.querySelector('button')).toBeNull();
			expect(fixture.nativeElement.textContent).not.toContain('Weg');
		});

		it('renders the button when hide is absent', () => {
			host.btn.set(makeButton({ type: 'raised', text: 'Da' }));
			fixture.detectChanges();

			expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
		});
	});

	describe('disabled', () => {
		const hostEl = () => fixture.nativeElement.querySelector('xiri-buttonstyle') as HTMLElement;
		const btnEl = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;

		it('lets clicks on an active button reach the consumer', () => {
			host.btn.set(makeButton({ type: 'raised', text: 'Aktiv', hint: 'Hinweis' }));
			fixture.detectChanges();

			btnEl().click();
			hostEl().click();

			expect(host.clicks).toBe(2);
		});

		it('keeps a disabled button without hint natively disabled', () => {
			host.btn.set(makeButton({ type: 'raised', text: 'Gesperrt' }));
			host.disabled.set(true);
			fixture.detectChanges();

			expect(btnEl().disabled).toBe(true);
			expect(btnEl().hasAttribute('aria-disabled')).toBe(false);
		});

		// The hint must stay reachable: no native disabled (pointer-events: none, no focus),
		// but marked disabled for assistive tech. jsdom has no hit-testing, so the tooltip
		// itself is only checked in the browser.
		it.each(['raised', 'icon'])('keeps a disabled %s button with hint interactive', (type) => {
			host.btn.set(makeButton({ type, text: 'Gesperrt', icon: 'edit', hint: 'Grund' }));
			host.disabled.set(true);
			fixture.detectChanges();

			expect(btnEl().disabled).toBe(false);
			expect(btnEl().getAttribute('aria-disabled')).toBe('true');
			expect(btnEl().classList).toContain('mat-mdc-button-disabled-interactive');
		});

		it('blocks clicks on a disabled button with hint', () => {
			host.btn.set(makeButton({ type: 'raised', text: 'Gesperrt', hint: 'Grund' }));
			host.disabled.set(true);
			fixture.detectChanges();

			btnEl().click();

			expect(host.clicks).toBe(0);
		});

		// Under a disabled button (pointer-events: none) a real click hits the inline host.
		it('blocks clicks that land on the host of a disabled button', () => {
			host.btn.set(makeButton({ type: 'raised', text: 'Gesperrt' }));
			host.disabled.set(true);
			fixture.detectChanges();

			hostEl().click();

			expect(host.clicks).toBe(0);
		});

		it('treats loading like disabled', () => {
			host.btn.set(makeButton({ type: 'raised', text: 'Lädt', hint: 'Grund' }));
			host.loading.set(true);
			fixture.detectChanges();

			btnEl().click();
			hostEl().click();

			expect(btnEl().getAttribute('aria-disabled')).toBe('true');
			expect(host.clicks).toBe(0);
		});

		// form, dialog, stepper, alert and table pass their own [disabled] expression.
		it('honours button.disabled even when the disabled input is false', () => {
			host.btn.set(makeButton({ type: 'raised', text: 'Gesperrt', disabled: true }));
			fixture.detectChanges();

			hostEl().click();

			expect(btnEl().disabled).toBe(true);
			expect(host.clicks).toBe(0);
		});
	});
});
