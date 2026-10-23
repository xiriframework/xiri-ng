import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { OpenUIError, OpenUiRendererComponent } from '@openuidev/angular-lang';
import { MatButton } from '@angular/material/button';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { DemoPageComponent } from '../demo-page/demo-page.component';
import { xiriOpenUiLibrary, xiriOpenUiPrompt } from './openui-library';

const example = `root = Card("Support-Überblick", [open, closed, sla, chart], "Diese Woche", "support_agent")
open = Stat("Offene Tickets", 12, null, "inbox", "warn")
closed = Stat("Geschlossen", 48, null, "task_alt", "success")
sla = Stat("SLA eingehalten", 96, " %", "timer")
chart = BarChart(["Mo", "Di", "Mi", "Do", "Fr"], [9, 14, 11, 8, 6], "Neue Tickets pro Tag")`;

const tokenKey = 'openui-bridge-token';
const notRunning = 'Brücke nicht erreichbar: npm run openui-bridge starten (hivectl bg start openui-bridge).';

function readToken(): string {
	try {
		return localStorage.getItem( tokenKey ) ?? '';
	} catch {
		return '';
	}
}

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
	prompt = xiriOpenUiPrompt;

	program = signal( example );
	response = signal( example );
	streaming = signal( false );
	errors = signal<OpenUIError[]>( [] );

	sectionClaude: XiriSectionSettings = {
		title: 'Frag Claude', subtitle: 'Über die Brücke zu claude -p (npm run openui-bridge, Schlüssel steht im Log)', icon: 'smart_toy',
	};
	question = signal( '' );
	token = signal( readToken() );
	sessionId = signal<string | null>( null );
	askStatus = signal( '' );

	private timer?: ReturnType<typeof setInterval>;
	private abort?: AbortController;

	constructor() {
		inject( DestroyRef ).onDestroy( () => {
			clearInterval( this.timer );
			this.abort?.abort();
		} );
	}

	setToken( value: string ): void {
		this.token.set( value );
		try {
			localStorage.setItem( tokenKey, value );
		} catch { /* ohne Storage nur für diese Sitzung */ }
	}

	async ask(): Promise<void> {
		this.abort = new AbortController();
		this.streaming.set( true );
		this.askStatus.set( 'Claude schreibt …' );
		try {
			const res = await fetch( '/openui-bridge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-Bridge-Token': this.token() },
				body: JSON.stringify( { message: this.question(), sessionId: this.sessionId() } ),
				signal: this.abort.signal,
			} );
			if ( !res.ok || !res.body ) {
				// Ohne Text kommt der Fehler vom Dev-Server-Proxy: die Brücke läuft nicht.
				const text = await res.text();
				this.askStatus.set( res.status === 401 ? 'Schlüssel fehlt oder ist falsch (steht im Log der Brücke).'
					: text ? `Fehler ${ res.status }: ${ text }` : notRunning );
				return;
			}
			this.sessionId.set( res.headers.get( 'X-Session-Id' ) );
			this.response.set( '' );
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			for ( let r = await reader.read(); !r.done; r = await reader.read() )
				this.response.update( t => t + decoder.decode( r.value, { stream: true } ) );
			this.program.set( this.response() );
			this.question.set( '' );
			this.askStatus.set( '' );
		} catch ( e ) {
			if ( ( e as Error ).name !== 'AbortError' )
				this.askStatus.set( notRunning );
		} finally {
			this.streaming.set( false );
		}
	}

	newConversation(): void {
		this.sessionId.set( null );
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
