import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriDoneComponent } from 'projects/xiri-ng/src/lib/done/done.component';
import { XiriErrorComponent } from 'projects/xiri-ng/src/lib/error/error.component';
import { XiriAlertComponent, XiriAlertConfig } from 'projects/xiri-ng/src/lib/alert/alert.component';
import { XiriMultiprogressComponent, XiriMultiprogressSettings } from 'projects/xiri-ng/src/lib/multiprogress/multiprogress.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component( {
	            selector: 'app-feedback',
	            templateUrl: './feedback.component.html',
	            styleUrl: './feedback.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriDoneComponent,
		            XiriErrorComponent,
		            XiriMultiprogressComponent,
		            MatButton,
		            MatIcon
	            ]
            } )
export class FeedbackComponent {

	private dialog = inject( MatDialog );

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Feedback & Status',
		subtitle: 'Statusmeldungen, Dialoge und Fortschrittsanzeigen',
		icon: 'notifications',
		iconColor: 'primary',
	};

	sectionDone: XiriSectionSettings = {
		title: 'XiriDoneComponent',
		subtitle: 'Animated success checkmark. Typically displayed after successful actions.',
		icon: 'check_circle',
		iconColor: 'success',
	};

	sectionError: XiriSectionSettings = {
		title: 'XiriErrorComponent',
		subtitle: 'Error message with configurable text. Displays an error icon and red text.',
		icon: 'error',
		iconColor: 'warn',
	};

	sectionAlert: XiriSectionSettings = {
		title: 'XiriAlertComponent (Dialog)',
		subtitle: 'Modal dialog for warnings and information. Opened via MatDialog.open().',
		icon: 'notification_important',
		iconColor: 'accent',
	};

	sectionMultiprogress: XiriSectionSettings = {
		title: 'XiriMultiprogressComponent',
		subtitle: 'Multiple progress bars with header, icon, and color configuration. show limits the visible count.',
		icon: 'linear_scale',
		iconColor: 'primary',
	};

	multiprogressSettings1: XiriMultiprogressSettings = {
		header: 'Storage Usage',
		headerIcon: 'storage',
		headerIconColor: 'accent',
		show: 2,
		data: [
			{ text: 'Documents', value: '2.4 GB', progress: 60, color: 'primary' },
			{ text: 'Images', value: '1.1 GB', progress: 28, color: 'accent' },
			{ text: 'Videos', value: '3.8 GB', progress: 95, color: 'warn' },
		]
	};

	multiprogressSettings2: XiriMultiprogressSettings = {
		header: 'Utilization',
		headerIcon: 'bar_chart',
		headerIconColor: 'primary',
		show: 3,
		data: [
			{ text: 'CPU', value: '78%', progress: 78, color: 'primary' },
			{ text: 'RAM', value: '45%', progress: 45, color: 'accent' },
			{ text: 'Disk', value: '92%', progress: 92, color: 'warn' },
			{ text: 'Network', value: '23%', progress: 23 },
		]
	};

	openAlert( type: 'warning' | 'info' ): void {
		const config: XiriAlertConfig = type === 'warning'
			? {
				header: 'Warning',
				text: 'This is a <b>warning</b>. Please note the instructions.',
				icon: 'warning',
				buttons: [
					{ text: 'Cancel', type: 'flat', action: 'close' },
					{ text: 'Understood', type: 'raised', action: 'confirm', color: 'primary' }
				]
			}
			: {
				header: 'Information',
				text: 'This is an <b>information</b>. Everything is working correctly.',
				icon: 'info',
				buttons: [
					{ text: 'Ok', type: 'raised', action: 'close', color: 'primary' }
				]
			};

		this.dialog.open( XiriAlertComponent, { data: config } );
	}
}
