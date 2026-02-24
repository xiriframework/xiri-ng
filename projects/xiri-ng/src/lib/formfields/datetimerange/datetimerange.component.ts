import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	Optional,
	Self
} from '@angular/core';
import {
	ControlValueAccessor,
	FormBuilder,
	FormControl,
	FormGroup,
	FormGroupDirective,
	FormsModule,
	NgControl,
	NgForm,
	ReactiveFormsModule
} from '@angular/forms';
import { MatFormFieldControl, MatSuffix } from '@angular/material/form-field';
import { FocusMonitor } from '@angular/cdk/a11y';
import { XiriDateService } from "../../services/date.service";
import { XiriFormField } from "../field.interface";
import { ErrorStateMatcher, MatOption } from "@angular/material/core";
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import {
	MatDatepicker,
	MatDatepickerInput,
	MatDatepickerToggle,
	MatDatepickerToggleIcon
} from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { XiriFieldMain } from "../helper/fieldmain";


interface DateTimeRangeForm {
	date: FormControl<Date | null>
	fhour: FormControl<number>
	fminute: FormControl<number>
	thour: FormControl<number>
	tminute: FormControl<number>
}

let nextUniqueIdXiriDateTimeRange = 0;

class DateTimeRange {
	constructor( public start: number, public end: number ) {
	}
}


@Component( {
	            selector: 'xiri-date-time-range',
	            templateUrl: './datetimerange.component.html',
	            styleUrl: './datetimerange.component.scss',
	            host: {
		            '[id]': 'id',
		            '(focus)': 'focus()',
	            },
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [ {
		            provide: MatFormFieldControl,
		            useExisting: XiriDateTimeRangeComponent
	            } ],
	            imports: [
		            FormsModule,
		            ReactiveFormsModule,
		            MatInput,
		            MatDatepickerInput,
		            MatSelect,
		            MatOption,
		            MatDatepickerToggle,
		            MatSuffix,
		            MatIcon,
		            MatDatepickerToggleIcon,
		            MatDatepicker,
	            ]
            } )
export class XiriDateTimeRangeComponent extends XiriFieldMain implements ControlValueAccessor,
                                                                         MatFormFieldControl<DateTimeRange | null | undefined> {
	
	protected _uid = `xiri-date-${ nextUniqueIdXiriDateTimeRange++ }`;
	
	public minDate: Date | null = null;
	public maxDate: Date | null = null;
	
	parts: FormGroup<DateTimeRangeForm>;
	
	private _lastValue: DateTimeRange | null = null;
	
	hours = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
	          '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
	          '20', '21', '22', '23' ];
	minutes = [ '00', '05', '10', '15',
	            '20', '25', '30', '35',
	            '40', '45', '50', '55', ];
	
	constructor( protected _focusMonitor: FocusMonitor,
	             protected _elementRef: ElementRef<HTMLElement>,
	             @Optional() _parentForm: NgForm,
	             @Optional() _parentFormGroup: FormGroupDirective,
	             protected _changeDetectorRef: ChangeDetectorRef,
	             public _defaultErrorStateMatcher: ErrorStateMatcher,
	             private dateService: XiriDateService,
	             @Optional() @Self() public ngControl: NgControl,
	             private fb: FormBuilder ) {
		
		super( _elementRef, _parentForm, _parentFormGroup,
		       _changeDetectorRef, _defaultErrorStateMatcher,
		       ngControl, _focusMonitor );
		
		this._id = this._uid;
		
		if ( this.ngControl != null )
			this.ngControl.valueAccessor = this;
		
		this.parts = this.fb.group<DateTimeRangeForm>( {
			                                               date: new FormControl<Date | null>( null ),
			                                               fhour: new FormControl<number>( 0, { nonNullable: true } ),
			                                               fminute: new FormControl<number>( 0, { nonNullable: true } ),
			                                               thour: new FormControl<number>( 0, { nonNullable: true } ),
			                                               tminute: new FormControl<number>( 0, { nonNullable: true } ),
		                                               } );
	}
	
	ngOnInit() {
		this.subs.add( this.parts.valueChanges.subscribe( () => {
			this.runCheck();
		} ) );
		
		super.ngOnInit();
	}
	
	@Input()
	set field( value: XiriFormField ) {
		
		if ( value.min )
			this.minDate = this.dateService.unixToLocal( value.min );
		if ( value.max )
			this.maxDate = this.dateService.unixToLocal( value.max );
		
		this.required = !!value.required;
		this.disabled = !!value.disabled;
		this.disabled ? this.parts.disable() : this.parts.enable();
		
		this.stateChanges.next();
	}
	
	@Input()
	get value(): DateTimeRange | null | undefined {
		
		const { date, fhour, fminute, thour, tminute } = this.parts.value;
		
		if ( !date && !this.required && !this.parts.valid )
			return this._disabled() ? null : undefined;
		if ( !date || fhour === undefined || fminute === undefined || thour === undefined || tminute === undefined )
			return null;
		
		let to = new Date( date.getTime() );
		
		date.setHours( fhour );
		date.setMinutes( fminute );
		
		to.setHours( thour );
		to.setMinutes( tminute );
		
		let unixFrom = this.dateService.dateToUnix( date );
		let unixTo = this.dateService.dateToUnix( to );
		
		if ( unixFrom > unixTo )
			return new DateTimeRange( unixTo, unixFrom );
		else
			return new DateTimeRange( unixFrom, unixTo );
	}
	
	set value( input: DateTimeRange | null | undefined ) {
		
		if ( input === null || input === undefined ) {
			if ( !this.required ) {
				this.parts.setValue( {
					                     date: null,
					                     fhour: 0,
					                     fminute: 0,
					                     thour: 0,
					                     tminute: 0,
				                     } );
				
				this.startChangeValue();
				return;
			}
		}
		
		const fromDate = this.dateService.unixToLocal( input.start );
		const toDate = this.dateService.unixToLocal( input.end );
		
		const fromHour = fromDate.getHours() ?? 0;
		const fromMinute = fromDate.getMinutes() ?? 0;
		const toHour = toDate.getHours() ?? 0;
		const toMinute = toDate.getMinutes() ?? 0;
		
		this.parts.setValue( {
			                     date: fromDate,
			                     fhour: fromHour,
			                     fminute: fromMinute,
			                     thour: toHour,
			                     tminute: toMinute,
		                     } );
		
		this.startChangeValue();
	}
	
	private runCheck(): void {
		
		if ( !this.ngControl )
			return;
		
		const val = this.value;
		if ( val === this._lastValue )
			this.stateChanges.next();
		else if ( val === null || val === undefined || this._lastValue === null || this._lastValue === undefined )
			this.changeValue( val );
		else if ( val.start == this._lastValue.start && val.end == this._lastValue.end )
			this.stateChanges.next();
		else
			this.changeValue( val );
	}
	
	protected startChangeValue(): void {
		this.runChangeValue( this.value );
	}
	
	private changeValue( val: DateTimeRange | null | undefined ) {
		
		this._lastValue = val;
		this.runChangeValue( val );
	}
	
	get empty() {
		const inputElement = this._elementRef.nativeElement.childNodes[ 0 ] as HTMLInputElement;
		return this.value === null && inputElement.value === '';
	}
	
	writeValue( value: DateTimeRange | null ): void {
		this.value = value;
	}
	
	getInt( num: string ): number {
		
		return parseInt( num );
	}
}
