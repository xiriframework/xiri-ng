import { ChangeDetectionStrategy, Component, effect, input, signal, ViewEncapsulation } from '@angular/core';

export interface XiriMarkdownSettings {
	text: string;
}

/**
 * Renders Markdown (GitHub flavour: tables, lists, code). `marked` is an optional peerDependency and loaded lazily.
 * The HTML goes through Angular's sanitizer (no safeHtml): the text may come from users or an LLM.
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

	html = signal( '' );

	constructor() {
		effect( () => {
			const text = this.settings().text ?? '';
			import( 'marked' ).then( m => this.html.set( m.marked.parse( text, { async: false } ) ) );
		} );
	}
}
