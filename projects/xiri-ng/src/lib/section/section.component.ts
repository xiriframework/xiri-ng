import { ChangeDetectionStrategy, Component, forwardRef, input, signal, TemplateRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { XiriButtonlineComponent, XiriButtonlineSettings } from '../buttonline/buttonline.component';
import { XiriDynComponentComponent } from '../dyncomponent/dyncomponent.component';
import { XiriDynData } from '../dyncomponent/dyndata.interface';

export interface XiriSectionSettings {
	title?: string
	subtitle?: string
	icon?: string
	iconColor?: string
	collapsible?: boolean
	collapsed?: boolean
	buttons?: XiriButtonlineSettings
	components?: XiriDynData[]
}

@Component( {
	            selector: 'xiri-section',
	            templateUrl: './section.component.html',
	            styleUrl: './section.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, MatDivider, XiriButtonlineComponent, forwardRef( () => XiriDynComponentComponent ) ]
            } )
export class XiriSectionComponent {

	settings = input.required<XiriSectionSettings>();
	dyncomponent = input<TemplateRef<any>>();

	collapsed = signal<boolean>( false );

	constructor() {
	}

	ngOnInit() {
		if ( this.settings().collapsed ) {
			this.collapsed.set( true );
		}
	}

	toggle() {
		this.collapsed.update( v => !v );
	}
}
