import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	inject,
	input,
	OnInit,
	signal,
	viewChild,
	WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { XiriButton } from "../button/button.component";
import { Observable, Subscription } from "rxjs";
import { MatStep, MatStepper } from "@angular/material/stepper";
import { XiriDataService } from "../services/data.service";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { XiriFormField } from "../formfields/field.interface";
import { XiriDoneComponent } from '../done/done.component';
import { XiriButtonstyleComponent } from '../buttonstyle/buttonstyle.component';
import { XiriErrorComponent } from '../error/error.component';
import { XiriFormFieldsComponent } from '../formfields/form-fields.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export interface XiriStepperSettings {
	url?: string
	steps: XiriStepperStep[]
}

export interface XiriStepperStep {
	url?: string
	title: string
	fields: XiriFormField[]
	data?: any
	extra?: any
	buttons: XiriButton[]
}

interface StepState {
	url?: string
	title: string
	completed: WritableSignal<boolean>
	check: WritableSignal<boolean>
	valid: WritableSignal<boolean>
	load: WritableSignal<boolean>
	gotonext: WritableSignal<boolean>
	errorMsg: WritableSignal<string | null>
	fields: WritableSignal<XiriFormField[]>
	buttons: WritableSignal<XiriButton[]>
	data?: any
	extra?: any
}


@Component( {
	            selector: 'xiri-stepper',
	            templateUrl: './stepper.component.html',
	            styleUrl: './stepper.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatStepper,
	                       MatStep,
	                       MatProgressSpinner,
	                       XiriFormFieldsComponent,
	                       XiriErrorComponent,
	                       XiriButtonstyleComponent,
	                       XiriDoneComponent ]
            } )
export class XiriStepperComponent implements OnInit {

	private dataService: XiriDataService = inject( XiriDataService );
	private location: Location = inject( Location );
	private router: Router = inject( Router );
	private destroyRef = inject( DestroyRef );

	settings = input.required<XiriStepperSettings>();

	public done = signal( false );
	private calls: Subscription[] = [];

	stepper = viewChild.required<MatStepper>( MatStepper );

	public steps = signal<StepState[]>( [] );


	ngOnInit(): void {
		const steps: StepState[] = [];
		for ( let i = 0; i != this.settings().steps.length; i++ ) {
			const step = this.settings().steps[ i ];

			steps.push( {
				url: step.url,
				title: step.title,
				completed: signal( false ),
				check: signal( false ),
				valid: signal( false ),
				load: signal( i > 0 ),
				gotonext: signal( false ),
				errorMsg: signal( null ),
				fields: signal<XiriFormField[]>( step.fields ),
				buttons: signal<XiriButton[]>( step.buttons ),
				data: step.data,
				extra: step.extra
			} );
		}
		this.steps.set( steps );
	}

	stepChanged( $event: StepperSelectionEvent ) {
		const step = this.steps()[ $event.selectedIndex ];

		if ( step.gotonext() ) {
			setTimeout( () => {
				this.stepper().next();
			}, 10 );
		}
	}

	formChanged( step: StepState, event: any, i: number ) {

		if ( event.valid )
			step.data = event.value;
		if ( !event.pristine ) {
			step.completed.set( false );
			const steps = this.steps();
			for ( let x = i + 1; x < steps.length; x++ ) {
				steps[ x ].completed.set( false );
				steps[ x ].load.set( true );
				steps[ x ].gotonext.set( false );
			}
		}

		step.valid.set( event.valid );
	}

	clickButton( button: XiriButton ): void {

		if ( button.action == 'back' )
			this.location.back();
		else if ( button.action == 'prev' ) {
			this.calls.forEach( c => c.unsubscribe() );
			this.calls = [];

			if ( this.stepper().selectedIndex != 0 ) {
				for ( let i = this.stepper().selectedIndex - 1; i != 0; i-- ) {
					if ( this.steps()[ i ].gotonext() )
						continue;

					this.stepper().selectedIndex = i;
					return;
				}

				this.stepper().selectedIndex = 0;
			} else
				this.location.back();
		} else if ( button.action == 'next' ) {
			const step = this.steps()[ this.stepper().selectedIndex ];
			if ( step.valid() && !step.check() )
				this.checkStep( this.stepper().selectedIndex );
		}
		else if ( button.action == 'get' ) {
			//
		} else if ( button.action == 'post' ) {
			//
		}
	}

	private checkStep( current: number ) {
		const steps = this.steps();
		const stepCurrent = steps[ current ];
		let stepNext: StepState | null = null;
		let needLoad: boolean;

		if ( current + 1 < steps.length ) {
			stepNext = steps[ current + 1 ];
			needLoad = stepNext.load();
		} else {
			needLoad = true;
		}

		if ( !needLoad ) {
			this.stepper().next();
			return;
		}

		stepCurrent.check.set( true );
		stepCurrent.errorMsg.set( null );

		const x = this.sendStep( current ).pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe(
			{
				next: ( res: any ) => {

					if ( res == null ) {
						this.showError( stepCurrent, null );
						return;
					}

					if ( res.step && res.step != current + 1 ) {

						for ( let i = current + 1; i != res.step; i++ ) {
							steps[ i ].completed.set( true );
							steps[ i ].gotonext.set( true );
							steps[ i ].load.set( false );
						}

						stepNext = steps[ res.step ];
					}

					if ( res.fields )
						stepNext.fields.set( res.fields );
					if ( res.buttons )
						stepNext.buttons.set( res.buttons );
					if ( res.url )
						stepNext.url = res.url;
					if ( stepNext ) {
						stepNext.load.set( false );
						stepNext.gotonext.set( false );
					}

					stepCurrent.check.set( false );
					stepCurrent.completed.set( true );

					if ( res.step && stepNext ) {
						setTimeout( () => {
							this.stepper().selectedIndex = res.step;
						}, 0 )
					} else if ( res.goto ) {
						this.done.set( true );
						setTimeout( () => {
							this.router.navigate( [ res.goto ] ).then();
						}, 1000 );
					}
				},
				error: ( err ) => {
					this.showError( stepCurrent, err );
				}
			} );

		this.calls.push( x );
	}

	private showError( stepCurrent: StepState, err: any ) {

		if ( err == null )
			stepCurrent.errorMsg.set( 'Unknown error' );
		else if ( err.status == 400 )
			stepCurrent.errorMsg.set( err.error.error || 'Format Error' );
		else if ( err.status == 403 )
			stepCurrent.errorMsg.set( 'Access denied' );
		else
			stepCurrent.errorMsg.set( 'Unknown error' );

		stepCurrent.check.set( false );
		stepCurrent.completed.set( false );
	}

	private sendStep( i: number ): Observable<any> {
		const steps = this.steps();
		let data = {};
		const step = steps[ i ];

		for ( let x = 0; x <= i; x++ )
			data = { ...data, ...steps[ x ].data };

		if ( step.extra )
			data = { ...data, ...step.extra };

		const url = step.url ? step.url : this.settings().url;
		return this.dataService.post( url, data );
	}

}
