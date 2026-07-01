import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriSearchComponent } from './search.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
	selector: 'test-host',
	template: `<xiri-search
		[placeholder]="placeholder()"
		[open]="open()"
		[reset]="reset()"
		[escape]="escape()"
		[focus]="focus()"
		[text]="text()"
		(changed)="onChanged($event)"
	/>`,
	imports: [XiriSearchComponent],
})
class TestHostComponent {
	placeholder = signal('');
	open = signal(false);
	reset = signal(-1);
	escape = signal(true);
	focus = signal(-1);
	text = signal('');
	lastChanged: string | null = null;
	changeCount = 0;
	onChanged(value: string) {
		this.lastChanged = value;
		this.changeCount++;
	}
}

describe('XiriSearchComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach(async () => {
		vi.useFakeTimers();
		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
		}).compileComponents();
		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should create the component', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should start with search hidden by default', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		expect(comp.show).toBe(false);
		expect(comp._text).toBe('');
	});

	it('should start with search shown when open=true', () => {
		// Need a fresh fixture where open=true before first detectChanges
		const fix2 = TestBed.createComponent(TestHostComponent);
		fix2.componentInstance.open.set(true);
		fix2.detectChanges();

		const comp = fix2.debugElement.children[0].componentInstance as XiriSearchComponent;
		expect(comp.show).toBe(true);
	});

	it('should emit changed after debounce on searchDo', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		comp._text = 'hello';
		comp.searchDo();

		vi.advanceTimersByTime(200);

		expect(host.lastChanged).toBe('hello');
	});

	it('should debounce search input', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		comp._text = 'a';
		comp.searchDo();

		vi.advanceTimersByTime(100);
		expect(host.lastChanged).toBeNull();

		comp._text = 'ab';
		comp.searchDo();

		vi.advanceTimersByTime(200);
		expect(host.lastChanged).toBe('ab');
	});

	it('should not emit for duplicate values', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		comp._text = 'test';
		comp.searchDo();
		vi.advanceTimersByTime(200);

		expect(host.changeCount).toBe(1);

		comp.searchDo();
		vi.advanceTimersByTime(200);

		expect(host.changeCount).toBe(1);
	});

	it('should toggle visibility on click', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		expect(comp.show).toBe(false);

		comp.click();
		expect(comp.show).toBe(true);

		comp.click();
		expect(comp.show).toBe(false);
	});

	it('should clear text on click', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		comp._text = 'something';
		comp.show = true;

		comp.click();
		vi.advanceTimersByTime(200);

		expect(comp._text).toBe('');
	});

	it('should not hide when open=true and click is called', () => {
		const fix2 = TestBed.createComponent(TestHostComponent);
		fix2.componentInstance.open.set(true);
		fix2.detectChanges();

		const comp = fix2.debugElement.children[0].componentInstance as XiriSearchComponent;
		expect(comp.show).toBe(true);

		comp.click();
		expect(comp.show).toBe(true);
	});

	it('should clear text and hide on escape', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		comp.show = true;
		comp._text = 'search text';

		comp.onKeydownHandler();
		vi.advanceTimersByTime(200);

		expect(comp._text).toBe('');
		expect(comp.show).toBe(false);
		expect(host.lastChanged).toBe('');
	});

	it('should not hide on escape when open=true', () => {
		const fix2 = TestBed.createComponent(TestHostComponent);
		fix2.componentInstance.open.set(true);
		fix2.detectChanges();

		const comp = fix2.debugElement.children[0].componentInstance as XiriSearchComponent;
		comp.show = true;
		comp._text = 'test';

		comp.onKeydownHandler();

		expect(comp.show).toBe(true);
		expect(comp._text).toBe('');
	});

	it('should not react to escape when escape=false', () => {
		host.escape.set(false);
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		comp.show = true;
		comp._text = 'test';

		comp.onKeydownHandler();
		vi.advanceTimersByTime(200);

		expect(comp.show).toBe(true);
		expect(comp._text).toBe('test');
	});

	it('should not react to escape when search is not shown', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		comp.show = false;

		comp.onKeydownHandler();
		vi.advanceTimersByTime(200);

		expect(host.lastChanged).toBeNull();
	});

	it('should reset text and show state on reset signal', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		comp.show = true;
		comp._text = 'old';

		host.reset.set(1);
		fixture.detectChanges();
		vi.advanceTimersByTime(200);

		expect(comp._text).toBe('');
		expect(host.lastChanged).toBe('');
	});

	it('should set text from text input signal', () => {
		host.text.set('preset');
		fixture.detectChanges();
		vi.advanceTimersByTime(200);

		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		expect(comp._text).toBe('preset');
		expect(comp.show).toBe(true);
	});

	it('should handle focus signal', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;

		host.focus.set(1);
		fixture.detectChanges();

		expect(comp.show).toBe(true);
	});

	it('should handle placeholder input', () => {
		host.placeholder.set('Type to search...');
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		expect(comp.placeholder()).toBe('Type to search...');
	});

	it('should handle empty placeholder', () => {
		const comp = fixture.debugElement.children[0].componentInstance as XiriSearchComponent;
		expect(comp.placeholder()).toBe('');
	});
});
