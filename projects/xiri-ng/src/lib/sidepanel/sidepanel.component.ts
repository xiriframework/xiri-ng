import { Component, ChangeDetectionStrategy, input } from '@angular/core';
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
	template: `
		<div class="sidepanel-header">
			<span class="sidepanel-title">{{ config().title }}</span>
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
}
