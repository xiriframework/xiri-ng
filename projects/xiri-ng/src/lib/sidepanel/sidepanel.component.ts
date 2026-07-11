import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { XiriDynComponentComponent } from '../dyncomponent/dyncomponent.component';
import { XiriSidepanelConfig } from './sidepanel.service';
import { XiriSidepanelRef } from './sidepanel-ref';

@Component( {
	selector: 'xiri-sidepanel',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './sidepanel.component.scss',
	imports: [ MatIconButton, MatIcon, XiriDynComponentComponent ],
	host: {
		role: 'dialog',
		'aria-modal': 'true',
		'[attr.aria-labelledby]': 'titleId()'
	},
	template: `
		<div class="sidepanel-header">
			<span class="sidepanel-title" [id]="titleId()">{{ config().title }}</span>
			<button mat-icon-button (click)="ref().close()" aria-label="Schließen"><mat-icon>close</mat-icon></button>
		</div>
		<div class="sidepanel-content">
			@if (config().data) {
				<xiri-dyncomponent [data]="$any(config().data)"></xiri-dyncomponent>
			}
		</div>
	`
} )
export class XiriSidepanelComponent {
	config = input.required<XiriSidepanelConfig>();
	ref = input.required<XiriSidepanelRef>();

	protected readonly titleId = computed( () => this.config().title ? 'xiri-sidepanel-title' : null );
}
