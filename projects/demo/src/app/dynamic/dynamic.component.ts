import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriDynComponentComponent } from 'projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component';
import { XiriDynData } from 'projects/xiri-ng/src/lib/dyncomponent/dyndata.interface';
import { XiriCardSettings } from 'projects/xiri-ng/src/lib/card/card.component';
import { XiriButton } from 'projects/xiri-ng/src/lib/button/button.component';
import { XiriButtonlineSettings } from 'projects/xiri-ng/src/lib/buttonline/buttonline.component';

@Component( {
	            selector: 'app-dynamic',
	            templateUrl: './dynamic.component.html',
	            styleUrl: './dynamic.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriDynComponentComponent ]
            } )
export class DynamicComponent {

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Dynamic Components',
		subtitle: 'Komponenten aus Konfigurationsdaten rendern',
		icon: 'widgets',
		iconColor: 'primary',
	};

	sectionDynComponent: XiriSectionSettings = {
		title: 'DynComponent: Card Variants',
		subtitle: 'Various card configurations rendered via XiriDynComponentComponent. Unknown types are caught by the dyncomponent template.',
		icon: 'grid_view',
		iconColor: 'primary',
	};

	sectionDynPage: XiriSectionSettings = {
		title: 'DynPage: Server-Driven Rendering',
		subtitle: 'The DynpageComponent is the wildcard route handler. It takes the current URL, calls the API, and renders XiriDynData[] dynamically.',
		icon: 'dns',
		iconColor: 'accent',
	};

	private content = {
		Line1: 'Lane 1',
		Line2: 'Lane 2',
	};
	private buttons: XiriButton[] = [
		{ type: 'icon', text: 'Name', action: 'api', icon: 'home' },
		{ type: 'icon', text: 'Name', action: 'api', icon: 'home' },
		{ type: 'icon', text: 'Name', action: 'api', icon: 'home' },
	];

	cardData: XiriDynData[] = [ {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card mit Buttons',
			headerIcon: 'home',
			data: this.content,
			buttonsTop: <XiriButtonlineSettings> { buttons: this.buttons }
		}
	}, {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Einfache Card',
			data: this.content
		}
	}, {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card mit Subheader',
			headerSub: 'subheader',
			data: this.content
		}
	}, {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card komplett',
			headerSub: 'subheader',
			headerIcon: 'home',
			data: this.content,
			buttons: this.buttons,
		}
	}, {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card mit Link-Rows',
			headerSub: 'subheader',
			headerIcon: 'home',
			data: [ {
				text: 'Lane 1',
				textLink: 'test',
				icon: 'home'
			}, {
				text: 'Lane 2',
				textLink: 'test',
				icon: 'home'
			} ],
			fields: [ { id: 'text', name: 'Link', format: 'linkrow' } ],
			buttons: this.buttons,
		}
	}, {
		type: 'test',
		data: '123 test out'
	} ];
}
