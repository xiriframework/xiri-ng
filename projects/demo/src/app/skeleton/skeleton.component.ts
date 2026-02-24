import { Component, signal } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriSkeletonComponent } from 'projects/xiri-ng/src/lib/skeleton/skeleton.component';
import { MatButton } from '@angular/material/button';

@Component( {
	            selector: 'app-skeleton',
	            templateUrl: './skeleton.component.html',
	            styleUrl: './skeleton.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriSkeletonComponent,
		            MatButton
	            ]
            } )
export class SkeletonComponent {

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Skeleton / Loading',
		subtitle: 'Lade-Platzhalter für Text, Bilder und Tabellen',
		icon: 'animation',
		iconColor: 'primary',
	};

	sectionTextLines: XiriSectionSettings = {
		title: 'Text Lines',
		subtitle: 'Default text skeleton with configurable line count.',
		icon: 'subject',
	};

	sectionCircle: XiriSectionSettings = {
		title: 'Circle',
		subtitle: 'Avatar or icon placeholder.',
		icon: 'radio_button_unchecked',
		iconColor: 'accent',
	};

	sectionRect: XiriSectionSettings = {
		title: 'Rectangle',
		subtitle: 'Image or card placeholder with custom dimensions.',
		icon: 'rectangle',
	};

	sectionTableRows: XiriSectionSettings = {
		title: 'Table Rows',
		subtitle: 'Simulates table loading with configurable rows and columns.',
		icon: 'table_rows',
		iconColor: 'primary',
	};

	sectionSimulate: XiriSectionSettings = {
		title: 'Simulate Loading',
		icon: 'play_circle',
		iconColor: 'success',
	};

	loaded = signal( false );

	simulateLoad(): void {
		this.loaded.set( false );
		setTimeout( () => this.loaded.set( true ), 2000 );
	}
}
