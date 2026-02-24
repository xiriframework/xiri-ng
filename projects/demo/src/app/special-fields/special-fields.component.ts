import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriFormSettings } from 'projects/xiri-ng/src/lib/form/form.component';
import { XiriFormComponent } from 'projects/xiri-ng/src/lib/form/form.component';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component( {
	            selector: 'app-special-fields',
	            templateUrl: './special-fields.component.html',
	            styleUrl: './special-fields.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriFormComponent, MatCard, MatCardContent ]
            } )
export class SpecialFieldsComponent {

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Special Form Fields',
		subtitle: 'Spezialisierte Eingabefelder',
		icon: 'tune',
		iconColor: 'primary',
	};

	sectionFileUpload: XiriSectionSettings = {
		title: 'File Upload',
		subtitle: "type: 'file' - File upload with accept (MIME filter) and multiple (multi-select).",
		icon: 'upload',
	};

	sectionVolume: XiriSectionSettings = {
		title: 'Volume',
		subtitle: "type: 'volume' - Input for length x width x height. Automatically calculates the volume.",
		icon: 'volume_up',
		iconColor: 'accent',
	};

	sectionTimelimit: XiriSectionSettings = {
		title: 'Timelimit',
		subtitle: "type: 'timelimit' - Weekday selection with time window (from/to). Configurable via texts object.",
		icon: 'timer',
	};

	sectionQuestion: XiriSectionSettings = {
		title: 'Question',
		subtitle: "type: 'question' - Displays an icon with text. Usable for confirmations or warnings.",
		icon: 'help',
		iconColor: 'accent',
	};

	sectionWaiting: XiriSectionSettings = {
		title: 'Waiting',
		subtitle: "type: 'waiting' - Displays a loading state. done: true switches to the completed state.",
		icon: 'hourglass_empty',
	};

	sectionChips: XiriSectionSettings = {
		title: 'Chips / Tags',
		subtitle: "type: 'chips' - Tag input with free text or autocomplete from a list. Press Enter or comma to add. When items come from a list with color, chips are colored accordingly.",
		icon: 'label',
		iconColor: 'primary',
	};

	fileForm: XiriFormSettings = {
		load: false,
		url: '',
		fields: [ {
			type: 'file',
			name: 'Single File',
			class: 'xcol-md-6 xcol-xl-4',
			id: 'file1',
			hint: 'PDF files only',
			accept: '.pdf',
			required: false,
			multiple: false,
		}, {
			type: 'file',
			name: 'Multiple Files',
			class: 'xcol-md-6 xcol-xl-4',
			id: 'file2',
			hint: 'PDF and images, max. 10MB',
			accept: '.pdf,.jpg,.png',
			required: false,
			multiple: true,
		} ],
		buttons: [ {
			text: 'Debug',
			type: 'raised',
			default: true,
			action: 'debug'
		} ]
	};

	volumeForm: XiriFormSettings = {
		load: false,
		url: '',
		fields: [ {
			type: 'volume',
			name: 'Volume',
			min: 0,
			max: 10,
			class: 'xcol-md-6 xcol-xl-4',
			id: 'volume',
			hint: 'Length x Width x Height',
			required: false,
		} ],
		buttons: [ {
			text: 'Debug',
			type: 'raised',
			default: true,
			action: 'debug'
		} ]
	};

	timelimitForm: XiriFormSettings = {
		load: false,
		url: '',
		fields: [ {
			type: 'timelimit',
			name: 'Time Restriction',
			class: 'xcol-md-12 xcol-xl-6',
			id: 'timelimit',
			texts: {
				weekdays: 'Weekdays',
				wd0: 'Sun',
				wd1: 'Mon',
				wd2: 'Tue',
				wd3: 'Wed',
				wd4: 'Thu',
				wd5: 'Fri',
				wd6: 'Sat',
				from: 'From',
				to: 'To',
				check: 'Active',
				inout: 'Within time range'
			},
			value: {
				check: false,
				wd: [ false, true, true, true, true, true, false ],
				fromhour: 8,
				frommin: 0,
				tohour: 17,
				tomin: 0,
				in: true
			}
		} ],
		buttons: [ {
			text: 'Debug',
			type: 'raised',
			default: true,
			action: 'debug'
		} ]
	};

	questionForm: XiriFormSettings = {
		load: false,
		url: '',
		fields: [ {
			type: 'question',
			name: 'Is all data correct?',
			class: 'xcol-md-6 xcol-xl-4',
			id: 'question1',
			icon: 'help',
			iconColor: 'primary',
		}, {
			type: 'question',
			name: 'Warning: This action cannot be undone',
			class: 'xcol-md-6 xcol-xl-4',
			id: 'question2',
			icon: 'warning',
			iconColor: 'warn',
		} ],
		buttons: [ {
			text: 'Debug',
			type: 'raised',
			default: true,
			action: 'debug'
		} ]
	};

	waitingForm: XiriFormSettings = {
		load: false,
		url: '',
		fields: [ {
			type: 'waiting',
			name: 'Loading...',
			class: 'xcol-md-6 xcol-xl-4',
			id: 'waiting1',
			done: false,
		}, {
			type: 'waiting',
			name: 'Loading complete',
			class: 'xcol-md-6 xcol-xl-4',
			id: 'waiting2',
			done: true,
		} ],
		buttons: []
	};

	chipsForm: XiriFormSettings = {
		load: false,
		url: '',
		fields: [ {
			type: 'chips',
			name: 'Tags (free text)',
			class: 'xcol-md-6',
			id: 'tags',
			hint: 'Type and press Enter',
			value: [ 'Angular', 'TypeScript' ],
		}, {
			type: 'chips',
			name: 'Categories (from list)',
			class: 'xcol-md-6',
			id: 'categories',
			hint: 'Select from suggestions',
			value: [ 'Frontend', 'Testing' ],
			list: [
				{ id: 1, name: 'Frontend', color: 'primary' },
				{ id: 2, name: 'Backend', color: 'accent' },
				{ id: 3, name: 'DevOps', color: 'warn' },
				{ id: 4, name: 'Design', color: 'purple' },
				{ id: 5, name: 'Testing', color: 'success' },
			],
		} ],
		buttons: [ {
			text: 'Debug',
			type: 'raised',
			default: true,
			action: 'debug'
		} ]
	};
}
