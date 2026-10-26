import { ChangeDetectionStrategy, Component, effect, input, output, signal, ViewEncapsulation } from '@angular/core';
import type { Marked } from 'marked';
import { escapeHtml } from '../echarts/tooltip';

export interface XiriMarkdownSettings {
	text: string;
}

// Eigene Instanz statt marked.use(): das würde die globale marked-Instanz der App mitverändern.
let parser: Marked | undefined;

/**
 * Renders Markdown (GitHub flavour: tables, lists, code). `marked` is an optional peerDependency and loaded lazily.
 * Raw HTML in the text is shown as text (only a bare inline `<br>` stays a line break, LLMs use it in table cells).
 * The result additionally goes through Angular's sanitizer (no safeHtml): the text may come from users or an LLM.
 * Without `marked` installed the text is shown as plain text.
 */
@Component( {
	selector: 'xiri-markdown',
	template: '<div class="xiri-markdown" [innerHTML]="html()"></div>',
	styleUrl: './markdown.component.scss',
	// HTML aus innerHTML trägt keine _ngcontent-Attribute; die Regeln zielen nur auf .xiri-markdown.
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
export class XiriMarkdownComponent {

	settings = input.required<XiriMarkdownSettings>();

	// Nach jedem Parsen, bevor Angular das neue HTML einsetzt: der Chat misst hier noch den alten Stand.
	rendered = output<void>();

	html = signal( '' );

	constructor() {
		effect( () => {
			const text = this.settings().text ?? '';
			// Error handler is required: without it, a consumer app missing the optional package fails at build time (esbuild).
			import( 'marked' ).then( m => {
				parser ??= new m.Marked( {
					renderer: { html: ( { text: raw } ) => /^<br\s*\/?>$/i.test( raw ) ? '<br>' : escapeHtml( raw ) },
				} );
				this.show( parser.parse( text, { async: false } ) );
			}, () => {
				console.error( 'marked is not installed. Add `npm install marked` to your app.' );
				this.show( escapeHtml( text ).replace( /\n/g, '<br>' ) );
			} );
		} );
	}

	private show( html: string ): void {
		this.html.set( html );
		this.rendered.emit();
	}
}
