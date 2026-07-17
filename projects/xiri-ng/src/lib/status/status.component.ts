import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

// Farbstufe des Status. Trägt nie allein die Bedeutung — das Label ist immer sichtbar.
export type XiriStatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

// Darstellungsform: gefüllte Pille, farbiger Punkt neben dem Label oder reiner Text.
export type XiriStatusVariant = 'badge' | 'dot' | 'text';

export interface XiriStatusSettings {
	label: string // immer sichtbar, nie nur über Farbe transportiert
	tone?: XiriStatusTone // default 'neutral'
	variant?: XiriStatusVariant // default 'badge'
	icon?: string // Material-Icon-Name, optional und rein redundant zum Label
	hint?: string // optionaler Tooltip/Zusatz
	ariaLabel?: string // überschreibt den zugänglichen Namen
}

@Component( {
	            selector:        'xiri-status',
	            templateUrl:     './status.component.html',
	            styleUrl:        './status.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports:         [ MatIcon ],
	            host:            {
		            '[class]':           'hostClass()',
		            '[attr.role]':       "'status'",
		            '[attr.aria-label]': 'settings().ariaLabel ?? null',
		            '[attr.title]':      'settings().hint ?? null'
	            }
            } )
export class XiriStatusComponent {

	settings = input.required<XiriStatusSettings>();

	tone    = computed<XiriStatusTone>( () => this.settings().tone ?? 'neutral' );
	variant = computed<XiriStatusVariant>( () => this.settings().variant ?? 'badge' );

	// Tone und Variant werden als Host-Klassen abgebildet; das SCSS mappt sie auf Tokens.
	hostClass = computed<string>( () => `xiri-status tone-${ this.tone() } variant-${ this.variant() }` );
}
