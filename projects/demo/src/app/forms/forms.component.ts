import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriFormSettings } from 'projects/xiri-ng/src/lib/form/form.component';
import { XiriFormComponent } from 'projects/xiri-ng/src/lib/form/form.component';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component( {
	            selector: 'app-forms',
	            templateUrl: './forms.component.html',
	            styleUrl: './forms.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriFormComponent, MatCard, MatCardContent ]
            } )
export class FormsComponent {

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Basic Form Fields',
		subtitle: 'Dynamische Formularfelder aus Konfigurationsobjekten',
		icon: 'edit_note',
		iconColor: 'primary',
	};

	sectionFieldTypes: XiriSectionSettings = {
		title: 'Field Types',
		subtitle: 'text, number, email, password, select, textarea, bool, header, info',
		icon: 'list',
		iconColor: 'accent',
	};

	sectionSections: XiriSectionSettings = {
		title: 'Collapsible Sections & Dividers',
		subtitle: "type: 'header' with collapsible: true creates expandable sections. type: 'divider' adds a visual separator.",
		icon: 'view_agenda',
	};

	sectionConditional: XiriSectionSettings = {
		title: 'Conditional Fields (showWhen)',
		subtitle: 'Fields can be shown/hidden based on other field values. Change the "Type" select to see fields appear/disappear.',
		icon: 'fork_right',
		iconColor: 'accent',
	};

	public data: XiriFormSettings = {
		load: false,
		url: '',
		header: 'Complete Form',
		fields: [ {
			type: 'text',
			name: 'Text',
			value: 'test',
			class: 'xcol-md-6 xcol-xl-3',
			id: 'text1',
		}, {
			type: 'number',
			name: 'Int',
			value: 1,
			class: 'xcol-md-6 xcol-xl-3',
			id: 'int1',
		}, {
			type: 'number',
			name: 'Int with Prefix/Suffix/Icons',
			value: 1,
			class: 'xcol-md-6 xcol-xl-3',
			textPrefix: '-',
			textSuffix: '#',
			iconPrefix: 'home',
			iconSuffix: 'home',
			id: 'int2',
		}, {
			type: 'email',
			name: 'email',
			value: 'email@nicce.at',
			class: 'xcol-md-6 xcol-xl-3',
			id: 'email',
		}, {
			type: 'password',
			name: 'password',
			value: 1,
			max: 10,
			class: 'xcol-md-6 xcol-xl-3',
			id: 'password',
		}, {
			type: 'select',
			name: 'Select with Search',
			value: 1,
			class: 'xcol-md-6 xcol-xl-3',
			list: [ { id: 1, name: 'Option 1' }, { id: 2, name: 'Option 2' }, { id: 3, name: 'Option 3' } ],
			id: 'select',
		}, {
			type: 'select',
			name: 'Select without Search',
			value: 1,
			class: 'xcol-md-6 xcol-xl-3',
			search: false,
			list: [ { id: 1, name: 'Option 1' }, { id: 2, name: 'Option 2' }, { id: 3, name: 'Option 3' } ],
			id: 'select3',
		}, {
			type: 'select',
			name: 'Select Server-Side',
			value: 1,
			class: 'xcol-md-6 xcol-xl-3',
			required: false,
			url: 'Test/Search/Select',
			params: null,
			list: [ { id: 1, name: 'Option 1' } ],
			id: 'select2',
		}, {
			type: 'textarea',
			name: 'textarea',
			value: 1,
			max: 10,
			class: 'xcol-start xcol-md-6 xcol-xl-3',
			id: 'textarea',
		}, {
			type: 'bool',
			name: 'Checkbox',
			hint: 'A checkbox with hint',
			class: 'xcol-start xcol-md-6 xcol-xl-3',
			id: 'bool',
		}, {
			type: 'header',
			name: 'Section Header',
			class: 'xcol-start xcol-md-6 xcol-xl-3',
			id: 'header',
		}, {
			type: 'info',
			name: 'Info Text',
			class: 'xcol-start xcol-md-6 xcol-xl-3',
			id: 'info',
		} ],
		buttons: [ {
			text: 'Debug',
			type: 'raised',
			default: true,
			action: 'debug'
		}, {
			text: 'Simulate',
			type: 'basic',
			action: 'simulate'
		}, {
			text: 'Link',
			type: 'stroked',
			action: 'link',
			url: '/Overview'
		}, {
			text: 'API',
			type: 'flat',
			action: 'api',
			url: 'Test/Wait/Wait',
			color: 'accent'
		} ]
	};

	public sectionsData: XiriFormSettings = {
		load: false,
		url: '',
		header: 'Form with Sections',
		fields: [ {
			type: 'header',
			name: 'Basic Information',
			value: 'Basic Information',
			class: 'xcol',
			id: 'section1',
			collapsible: true,
			collapsed: false,
		}, {
			type: 'text',
			name: 'First Name',
			class: 'xcol-md-6',
			id: 'firstName',
		}, {
			type: 'text',
			name: 'Last Name',
			class: 'xcol-md-6',
			id: 'lastName',
		}, {
			type: 'email',
			name: 'Email',
			class: 'xcol-md-6',
			id: 'sectionEmail',
		}, {
			type: 'divider',
			id: 'divider1',
			value: 'or',
			class: 'xcol',
		}, {
			type: 'header',
			name: 'Advanced Settings',
			value: 'Advanced Settings',
			class: 'xcol',
			id: 'section2',
			collapsible: true,
			collapsed: true,
		}, {
			type: 'select',
			name: 'Role',
			value: 1,
			class: 'xcol-md-6',
			search: false,
			list: [ { id: 1, name: 'User' }, { id: 2, name: 'Admin' }, { id: 3, name: 'Moderator' } ],
			id: 'role',
		}, {
			type: 'number',
			name: 'Max Sessions',
			value: 5,
			class: 'xcol-md-6',
			id: 'maxSessions',
			min: 1,
			max: 100,
		}, {
			type: 'header',
			name: 'Notifications',
			value: 'Notifications',
			class: 'xcol',
			id: 'section3',
			collapsible: true,
			collapsed: false,
		}, {
			type: 'bool',
			name: 'Email Notifications',
			class: 'xcol-md-6',
			id: 'emailNotify',
		}, {
			type: 'bool',
			name: 'SMS Notifications',
			class: 'xcol-md-6',
			id: 'smsNotify',
		} ],
		buttons: [ {
			text: 'Debug',
			type: 'raised',
			default: true,
			action: 'debug'
		} ]
	};

	public conditionalData: XiriFormSettings = {
		load: false,
		url: '',
		header: 'Conditional Fields (showWhen)',
		fields: [ {
			type: 'select',
			name: 'Type',
			value: 1,
			class: 'xcol-md-6',
			search: false,
			list: [ { id: 1, name: 'Basic' }, { id: 2, name: 'Advanced' }, { id: 3, name: 'Expert' } ],
			id: 'type',
		}, {
			type: 'text',
			name: 'Basic Field',
			class: 'xcol-md-6',
			id: 'basicField',
			hint: 'Always visible',
		}, {
			type: 'text',
			name: 'Advanced Field',
			class: 'xcol-md-6',
			id: 'advancedField',
			hint: 'Visible when Type = Advanced or Expert',
			showWhen: [ { field: 'type', operator: 'in', value: [ 2, 3 ] } ],
		}, {
			type: 'number',
			name: 'Expert Setting',
			class: 'xcol-md-6',
			id: 'expertSetting',
			hint: 'Visible when Type = Expert',
			showWhen: { field: 'type', operator: 'equals', value: 3 },
		} ],
		buttons: [ {
			text: 'Debug',
			type: 'raised',
			default: true,
			action: 'debug'
		} ]
	};
}
