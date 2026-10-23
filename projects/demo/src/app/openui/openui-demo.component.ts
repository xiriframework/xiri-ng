import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { OpenUIError, OpenUiRendererComponent } from '@openuidev/angular-lang';
import { MatButton } from '@angular/material/button';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { DemoPageComponent } from '../demo-page/demo-page.component';
import { xiriOpenUiLibrary } from './openui-library';

const example = `root = Card("Support-Überblick", [open, closed, sla, chart], "Diese Woche", "support_agent")
open = Stat("Offene Tickets", 12, null, "inbox", "warn")
closed = Stat("Geschlossen", 48, null, "task_alt", "success")
sla = Stat("SLA eingehalten", 96, " %", "timer")
chart = BarChart(["Mo", "Di", "Mi", "Do", "Fr"], [9, 14, 11, 8, 6], "Neue Tickets pro Tag")`;

@Component( {
	selector: 'app-openui-demo',
	templateUrl: './openui-demo.component.html',
	styleUrl: './openui-demo.component.scss',
	imports: [ DemoPageComponent, XiriPageHeaderComponent, XiriSectionComponent, OpenUiRendererComponent, MatButton ],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
export class OpenUiDemoComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [ { label: 'Home', link: '/Overview', icon: 'home' }, { label: 'OpenUI Lang' } ];

	pageHeader: XiriPageHeaderSettings = {
		title: 'OpenUI Lang',
		subtitle: 'Ein LLM schreibt OpenUI Lang, xiri rendert es mit eigenen Komponenten (Prototyp: Card, Stat, BarChart)',
		icon: 'smart_toy',
		iconColor: 'primary',
	};

	sectionProgram: XiriSectionSettings = { title: 'Programm', subtitle: 'Bearbeiten rendert sofort; „Streamen“ spielt es wie eine Modellantwort ab.', icon: 'code' };
	sectionPrompt: XiriSectionSettings = {
		title: 'Systemprompt', subtitle: 'Aus der Bibliothek erzeugt, für ein beliebiges LLM', icon: 'description', collapsible: true, collapsed: true,
	};

	library = xiriOpenUiLibrary;
	prompt = xiriOpenUiLibrary.prompt();

	program = signal( example );
	response = signal( example );
	streaming = signal( false );
	errors = signal<OpenUIError[]>( [] );

	private timer?: ReturnType<typeof setInterval>;

	constructor() {
		inject( DestroyRef ).onDestroy( () => clearInterval( this.timer ) );
	}

	edit( value: string ): void {
		this.program.set( value );
		this.response.set( value );
	}

	// ponytail: fester Takt statt echter Tokens; reicht, um das Streaming-Verhalten des Parsers zu zeigen.
	stream(): void {
		const text = this.program();
		let pos = 0;
		this.streaming.set( true );
		this.response.set( '' );
		this.timer = setInterval( () => {
			pos += 6;
			this.response.set( text.slice( 0, pos ) );
			if ( pos >= text.length ) {
				clearInterval( this.timer );
				this.streaming.set( false );
			}
		}, 20 );
	}
}
