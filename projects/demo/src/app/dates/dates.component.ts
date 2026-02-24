import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriFormSettings } from 'projects/xiri-ng/src/lib/form/form.component';
import { XiriFormComponent } from 'projects/xiri-ng/src/lib/form/form.component';
import { MatCard } from '@angular/material/card';

@Component( {
	            selector: 'app-dates',
	            templateUrl: './dates.component.html',
	            styleUrls: [ './dates.component.scss' ],
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, MatCard, XiriFormComponent ]
            } )
export class DatesComponent {

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Date & Time',
		subtitle: 'Date-, DateRange- und DateTimeRange-Picker',
		icon: 'calendar_month',
		iconColor: 'primary',
	};

	sectionDateFields: XiriSectionSettings = {
		title: 'Date Field Types',
		subtitle: 'date, datetime, daterange, datetimerange — alle Werte werden als Unix-Timestamps (Sekunden) verarbeitet.',
		icon: 'calendar_month',
	};

	public data: XiriFormSettings = {
		load: false,
		url: '',
		fields: [ {
			type: 'date',
			name: 'date no max',
			value: ( new Date().getTime() ) / 1000 - ( 3600 * 24 * 4 ),
			class: 'xcol-md-6 xcol-xl-3',
			required: true,
			min: ( new Date().getTime() ) / 1000 - ( 3600 * 24 * 14 ),
			id: 'date',
			hint: 'date',
		}, {
			type: 'date',
			subtype: 'datetime',
			name: 'datetime',
			value: ( new Date().getTime() ) / 1000 - ( 3600 * 24 * 4 ),
			class: 'xcol-start xcol-md-6 xcol-xl-3',
			min: ( new Date().getTime() ) / 1000 - ( 3600 * 24 * 14 ),
			max: ( new Date().getTime() ) / 1000 + ( 3600 * 24 ),
			id: 'datetime',
			hint: 'test',
			required: false,
		}, {
			type: 'daterange',
			name: 'daterange',
			class: 'xcol-start xcol-md-6 xcol-xl-3',
			min: ( new Date().getTime() ) / 1000 - ( 3600 * 24 * 14 ),
			max: ( new Date().getTime() ) / 1000 + ( 3600 * 24 ),
			value: {
				start: ( new Date().getTime() ) / 1000 - ( 3600 * 24 * 4 ),
				end: ( new Date().getTime() ) / 1000 - ( 3600 * 24 )
			},
			required: false,
			disabled: false,
			id: 'daterange',
		}, {
			type: 'daterange',
			name: 'daterange2',
			class: 'xcol-start xcol-md-6 xcol-xl-3',
			min: ( new Date().getTime() ) / 1000 - ( 3600 * 24 * 100 ),
			max: ( new Date().getTime() ) / 1000 + ( 3600 * 24 ),
			value: {
				start: ( new Date().getTime() ) / 1000 - ( 3600 * 24 * 4 ),
				end: ( new Date().getTime() ) / 1000 - ( 3600 * 24 )
			},
			required: true,
			disabled: false,
			id: 'daterange2',
		}, {
			type: 'datetimerange',
			name: 'datetimerange',
			class: 'xcol-start xcol-md-6 xcol-xl-3',
			min: ( new Date().getTime() ) / 1000 - ( 3600 * 24 * 14 ),
			max: ( new Date().getTime() ) / 1000 + ( 3600 * 24 ),
			value: {
				start: ( new Date().setMinutes( 10, 0, 0 ) ) / 1000 - ( 3600 * 24 ) - ( 3600 * 3 ),
				end: ( new Date().setMinutes( 10, 0, 0 ) ) / 1000 - ( 3600 * 24 )
			},
			required: false,
			id: 'datetimerange',
		},

			{
				type: 'datetime',
				name: 'disabled',
				class: 'xcol-start xcol-md-6 xcol-xl-3',
				required: true,
				disabled: false,
				id: 'datetimerangeDIS1',
			},
			{
				type: 'datetime',
				name: 'disabled',
				class: 'xcol-start xcol-md-6 xcol-xl-3',
				required: false,
				disabled: true,
				id: 'datetimerangeDIS',
			},
		],
		buttons: [ {
			text: 'Ok',
			type: 'raised',
			default: true,
			action: 'debug'
		} ]
	};
}
