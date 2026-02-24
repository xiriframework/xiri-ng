import { Component, inject } from '@angular/core';
import { XiriSnackbarService } from 'projects/xiri-ng/src/lib/services/snackbar.service';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component( {
	            selector: 'app-snackbar',
	            templateUrl: './snackbar.component.html',
	            styleUrl: './snackbar.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            MatButton,
		            MatIcon
	            ]
            } )
export class SnackbarComponent {

	private snackbar = inject( XiriSnackbarService );

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Snackbar / Toast',
		subtitle: 'Kurze Benachrichtigungen via SnackbarService',
		icon: 'notifications_active',
		iconColor: 'primary',
	};

	sectionBasicVariants: XiriSectionSettings = {
		title: 'Basic Variants',
		subtitle: 'Four types with different colors and default durations.',
		icon: 'notifications',
	};

	sectionWithAction: XiriSectionSettings = {
		title: 'With Action Button',
		subtitle: 'Snackbars can include an action button (e.g. "Undo").',
		icon: 'smart_button',
		iconColor: 'accent',
	};

	sectionUsage: XiriSectionSettings = {
		title: 'Usage',
		icon: 'code',
	};

	showSuccess(): void {
		this.snackbar.success( 'Operation completed successfully!' );
	}

	showError(): void {
		this.snackbar.error( 'An error occurred. Please try again.' );
	}

	showInfo(): void {
		this.snackbar.info( 'Here is some useful information.' );
	}

	showWarning(): void {
		this.snackbar.warning( 'Please check your input before proceeding.' );
	}

	showWithAction(): void {
		const ref = this.snackbar.success( 'Item deleted.', 5000, 'Undo' );
		ref.onAction().subscribe( () => {
			this.snackbar.info( 'Action undone!' );
		} );
	}
}
