import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { XiriButtonlineComponent, XiriButtonlineSettings } from '../buttonline/buttonline.component';
import { XiriSearchComponent } from '../search/search.component';

export interface XiriToolbarSearchConfig {
	placeholder?: string
}

export interface XiriToolbarSettings {
	title?: string
	icon?: string
	search?: boolean | XiriToolbarSearchConfig
	buttons?: XiriButtonlineSettings
}

@Component( {
	            selector: 'xiri-toolbar',
	            templateUrl: './toolbar.component.html',
	            styleUrl: './toolbar.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, XiriButtonlineComponent, XiriSearchComponent ]
            } )
export class XiriToolbarComponent {

	settings = input.required<XiriToolbarSettings>();
	filterData = input<any>( undefined );

	searchChanged = output<string>();

	searchPlaceholder = computed( () => {
		const search = this.settings().search;
		if ( typeof search === 'object' && search?.placeholder ) {
			return search.placeholder;
		}
		return '';
	} );
}
