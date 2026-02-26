import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	MAT_DIALOG_DATA,
	MatDialogRef,
	MatDialogTitle,
	MatDialogContent,
	MatDialogActions
} from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { XiriButton } from "../button/button.component";
import { SafehtmlPipe } from '../pipes/safehtml.pipe';
import { XiriButtonstyleComponent } from '../buttonstyle/buttonstyle.component';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CdkScrollable } from '@angular/cdk/scrolling';


export interface XiriAlertConfig {
	header: string
	text: string
	icon: string
	buttons: XiriButton[]
}

@Component( {
	            selector: 'xiri-alert',
	            templateUrl: './alert.component.html',
	            styleUrls: [ './alert.component.scss' ],
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatDialogTitle,
	                       CdkScrollable,
	                       MatDialogContent,
	                       MatProgressSpinner,
	                       MatIcon,
	                       MatDivider,
	                       MatDialogActions,
	                       XiriButtonstyleComponent,
	                       SafehtmlPipe ]
            } )
export class XiriAlertComponent implements OnInit {
	dialogRef = inject<MatDialogRef<XiriAlertComponent>>( MatDialogRef );
	initData = inject( MAT_DIALOG_DATA );
	private breakpointObserver = inject( BreakpointObserver );
	private destroyRef = inject( DestroyRef );


	loading = signal(true);
	header = signal('');
	buttons = signal<XiriButton[]>([]);
	text = signal('');
	icon = signal('warning');

	ngOnInit() {

		this.breakpointObserver
			.observe( [ Breakpoints.XSmall, Breakpoints.Small ] )
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe( ( state: BreakpointState ) => {
				if ( state.matches )
					this.dialogRef.updateSize( '80vw' );
				else
					this.dialogRef.updateSize( '600px' );
			} );

		this.loadData( this.initData );
	}
	
	private loadData( res: XiriAlertConfig ): void {

		if ( res.buttons ) {
			this.header.set( res.header );
			this.buttons.set( res.buttons );
			this.text.set( res.text );
			this.icon.set( res.icon ? res.icon : 'warning' );
		} else {
			this.dialogRef.close( res );
		}

		this.loading.set( false );
	}
	
	clickButton( button: XiriButton ): void {

		this.dialogRef.close( button );
	}
}
