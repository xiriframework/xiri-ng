import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatFormField, MatFormFieldControl, MatLabel } from "@angular/material/form-field";
import {
	AbstractControl,
	ControlValueAccessor,
	FormControl,
	FormGroup,
	FormsModule,
	NgControl,
	ReactiveFormsModule,
	ValidationErrors
} from "@angular/forms";
import { Subject } from "rxjs";
import { FocusMonitor } from "@angular/cdk/a11y";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { KeyValuePipe } from '@angular/common';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';

interface TimelimitForm {
	check: FormControl<boolean>
	wd0: FormControl<boolean>
	wd1: FormControl<boolean>
	wd2: FormControl<boolean>
	wd3: FormControl<boolean>
	wd4: FormControl<boolean>
	wd5: FormControl<boolean>
	wd6: FormControl<boolean>
	fromhour: FormControl<number>
	frommin: FormControl<number>
	tohour: FormControl<number>
	tomin: FormControl<number>
	inout: FormControl<boolean>
}

interface TimelimitValue {
	check: boolean;
	wd: boolean[];
	fromhour: number;
	frommin: number;
	tohour: number;
	tomin: number;
	in: boolean;
}


@Component( {
	            selector: 'xiri-timelimit',
	            templateUrl: './timelimit.component.html',
	            styleUrls: [ './timelimit.component.scss' ],
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            host: {
		            '[id]': 'id',
		            '[attr.aria-describedby]': 'describedBy'
	            },
	            providers: [ {
		            provide: MatFormFieldControl,
		            useExisting: XiriTimelimitComponent
	            } ],
	            imports: [
		            FormsModule,
		            ReactiveFormsModule,
		            MatCheckbox,
		            MatLabel,
		            MatFormField,
		            MatSelect,
		            MatOption,
		            KeyValuePipe,
	            ]
            } )
export class XiriTimelimitComponent implements ControlValueAccessor, MatFormFieldControl<TimelimitValue>, OnInit, OnDestroy {
	private focusMonitor = inject( FocusMonitor );
	ngControl = inject( NgControl, { optional: true, self: true } );
	private _elementRef = inject<ElementRef<HTMLElement>>( ElementRef );
	private cdr = inject( ChangeDetectorRef );
	
	
	static nextId = 0;
	id = `xiri-timelimit-${ XiriTimelimitComponent.nextId++ }`;
	describedBy = '';
	
	readonly autofilled: boolean;
	
	errorState = false;
	parts: FormGroup<TimelimitForm>;
	stateChanges = new Subject<void>();
	focused = false;
	controlType = 'xiri-timelimit';
	
	private _placeholder = '';
	private _required = true;
	private _disabled = false;
	shouldLabelFloat = true;
	
	hours = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
	          '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
	          '20', '21', '22', '23', '24' ];
	minutes = {
		0: '00',
		5: '05',
		10: '10',
		15: '15',
		20: '20',
		25: '25',
		30: '30',
		35: '35',
		40: '40',
		45: '45',
		50: '50',
		55: '55'
	};
	
	constructor() {
		if ( this.ngControl != null ) {
			this.ngControl.valueAccessor = this;
		}
		
		this.parts = new FormGroup<TimelimitForm>( {
			                                           check: new FormControl<boolean>( false ),
			                                           wd0: new FormControl<boolean>( true ),
			                                           wd1: new FormControl<boolean>( false ),
			                                           wd2: new FormControl<boolean>( false ),
			                                           wd3: new FormControl<boolean>( false ),
			                                           wd4: new FormControl<boolean>( false ),
			                                           wd5: new FormControl<boolean>( false ),
			                                           wd6: new FormControl<boolean>( false ),
			                                           fromhour: new FormControl<number>( 0 ),
			                                           frommin: new FormControl<number>( 0 ),
			                                           tohour: new FormControl<number>( 24 ),
			                                           tomin: new FormControl<number>( 0 ),
			                                           inout: new FormControl<boolean>( true ),
		                                           } );
		
		this.focusMonitor.monitor( this._elementRef.nativeElement, true ).subscribe( origin => {

			if ( this.focused && !origin ) {
				this.onTouched();
			}
			this.focused = !!origin;
			if ( this.focused )
				this.ngControl.control?.markAllAsTouched();

			this.onChange( this.value );
			this.stateChanges.next();
			this.cdr.markForCheck();
		} );
	}
	
	onChange: ( value: TimelimitValue ) => void = () => { /* intentionally empty */ };
	onTouched = () => { /* intentionally empty */ };
	
	ngOnInit() {
		
		this.ngControl.control?.setValidators( [ this.validate.bind( this ) ] );
		this.ngControl.control?.updateValueAndValidity();
	}
	
	validate( { value }: AbstractControl ): ValidationErrors | null {

		const limit = value as TimelimitValue | null;
		let isNotValid = false;

		if ( limit === null )
			isNotValid = true;
		else if ( limit.check ) {
			if ( limit.tohour == 24 && limit.tomin != 0 )
				isNotValid = true;
			if ( limit.fromhour == 24 )
				isNotValid = true;
			if ( limit.fromhour > limit.tohour )
				isNotValid = true;
			if ( limit.fromhour == limit.tohour && limit.frommin >= limit.tomin )
				isNotValid = true;
			if ( ( ( limit.wd[ 0 ] &&
			         limit.wd[ 1 ] &&
			         limit.wd[ 2 ] &&
			         limit.wd[ 3 ] &&
			         limit.wd[ 4 ] &&
			         limit.wd[ 5 ] &&
			         limit.wd[ 6 ] ) ||
			       ( !limit.wd[ 0 ] &&
			         !limit.wd[ 1 ] &&
			         !limit.wd[ 2 ] &&
			         !limit.wd[ 3 ] &&
			         !limit.wd[ 4 ] &&
			         !limit.wd[ 5 ] &&
			         !limit.wd[ 6 ] ) ) &&
			     limit.fromhour == 0 && limit.frommin == 0 && limit.tohour == 24 && limit.frommin == 0 ) {
				isNotValid = true;
			}
		}

		return isNotValid ? { invalid: isNotValid } : null;
	}
	
	ngOnDestroy() {
		this.stateChanges.complete();
		this.focusMonitor.stopMonitoring( this._elementRef.nativeElement );
	}
	
	public changed() {
		this.onChange( this.value );
	}
	
	@Input()
	get placeholder(): string {
		return this._placeholder;
	}
	
	set placeholder( value: string ) {
		this._placeholder = value;
		this.stateChanges.next();
	}
	
	@Input()
	get required(): boolean {
		return this._required;
	}
	
	set required( value: boolean ) {
		this._required = coerceBooleanProperty( value );
		this.stateChanges.next();
	}
	
	@Input()
	get disabled(): boolean {
		return this._disabled;
	}
	
	set disabled( value: boolean ) {
		this._disabled = coerceBooleanProperty( value );
		if ( this._disabled )
			this.parts.disable();
		else
			this.parts.enable();
		this.stateChanges.next();
	}
	
	@Input()
	get value(): TimelimitValue {

		const value = this.parts.value;
		return {
			check: value.check,
			wd: [ value.wd0, value.wd1, value.wd2, value.wd3, value.wd4, value.wd5, value.wd6 ],
			fromhour: value.fromhour,
			frommin: value.frommin,
			tohour: value.tohour,
			tomin: value.tomin,
			in: value.inout
		};
	}

	set value( input: TimelimitValue | null | undefined ) {

		if ( input === null || input === undefined )
			return;

		this.parts.setValue( {
			                     check: input.check,
			                     wd0: input.wd[ 0 ],
			                     wd1: input.wd[ 1 ],
			                     wd2: input.wd[ 2 ],
			                     wd3: input.wd[ 3 ],
			                     wd4: input.wd[ 4 ],
			                     wd5: input.wd[ 5 ],
			                     wd6: input.wd[ 6 ],
			                     fromhour: parseInt( String( input.fromhour ) ),
			                     frommin: parseInt( String( input.frommin ) ),
			                     tohour: parseInt( String( input.tohour ) ),
			                     tomin: parseInt( String( input.tomin ) ),
			                     inout: input.in
		                     } );

		this.onChange( this.value );
		this.stateChanges.next();
	}

	get empty() {
		return this.value === null;
	}

	writeValue( value: TimelimitValue | null | undefined ): void {
		this.value = value;
	}

	registerOnChange( fn: ( value: TimelimitValue ) => void ): void {
		this.onChange = fn;
	}

	registerOnTouched( fn: () => void ): void {
		this.onTouched = fn;
	}

	setDisabledState( isDisabled: boolean ): void {
		this.disabled = isDisabled;
	}

	setDescribedByIds( ids: string[] ) {
		this.describedBy = ids.join( ' ' );
	}

	onContainerClick(): void { /* intentionally empty */ }

	public _texts: Record<string, string> = {};

	@Input()
	get texts(): Record<string, string> {

		return this._texts;
	}

	set texts( input: Record<string, string> ) {

		if ( input === null || input === undefined )
			return;
		this._texts = input;
	}

	onCompare(): number {
		return -1;
	}
	
}
