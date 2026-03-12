import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	OnInit,
} from '@angular/core';
import {
	ControlValueAccessor,
	FormBuilder,
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule
} from '@angular/forms';
import { MatFormFieldControl, MatSuffix } from '@angular/material/form-field';
import { XiriDateService } from "../../services/date.service";
import { XiriFormField } from "../field.interface";
import { MatIcon } from '@angular/material/icon';
import {
	MatDatepickerToggle,
	MatDatepickerToggleIcon,
	MatDateRangeInput,
	MatDateRangePicker,
	MatEndDate,
	MatStartDate
} from '@angular/material/datepicker';
import { XiriFieldMain } from "../helper/fieldmain";


interface DateRangeForm {
	start: FormControl<Date | null>
	end: FormControl<Date | null>
}

let nextUniqueIdXiriDateRange = 0;

class DateRange {
	constructor( public start: number, public end: number ) {
	}
}

@Component( {
	            selector: 'xiri-date-range',
	            templateUrl: './daterange.component.html',
	            styleUrl: './daterange.component.scss',
	            host: {
		            '[id]': 'id',
		            '(focus)': 'focus()',
	            },
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [ {
		            provide: MatFormFieldControl,
		            useExisting: XiriDateRangeComponent
	            } ],
	            imports: [
		            FormsModule,
		            ReactiveFormsModule,
		            MatDateRangeInput,
		            MatStartDate,
		            MatEndDate,
		            MatDatepickerToggle,
		            MatSuffix,
		            MatIcon,
		            MatDatepickerToggleIcon,
		            MatDateRangePicker,
	            ]
            } )
export class XiriDateRangeComponent extends XiriFieldMain implements OnInit,
                                                                     ControlValueAccessor,
                                                                     MatFormFieldControl<DateRange | null | undefined> {
	
	protected _uid = `xiri-date-${ nextUniqueIdXiriDateRange++ }`;
	
	public minDate: Date | null = null;
	public maxDate: Date | null = null;
	
	parts: FormGroup<DateRangeForm>;
	
	private _lastValue: DateRange | null = null;
	
	private dateService = inject( XiriDateService );
	private fb = inject( FormBuilder );

	constructor() {
		super();

		this._id = this._uid;

		if ( this.ngControl != null )
			this.ngControl.valueAccessor = this;

		this.parts = this.fb.group<DateRangeForm>( {
			                                           start: new FormControl<Date | null>( null ),
			                                           end: new FormControl<Date | null>( null ),
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
	get value(): DateRange | null | undefined {
		
		const { start, end } = this.parts.value;
		
		if ( start === null || end === null ) {
			if ( this.required ) {
				return this.parts.valid ? null : this._disabled() ? null : undefined;
			} else {
				if ( start === end )
					return this.parts.valid ? null : this._disabled() ? null : undefined;
				else
					return undefined;
			}
		}
		
		let unixFrom = this.dateService.dateToUnix( start );
		let unixTo = this.dateService.dateToUnix( end );
		
		if ( unixFrom > unixTo )
			return new DateRange( unixTo, unixFrom );
		else
			return new DateRange( unixFrom, unixTo );
	}
	
	set value( input: DateRange | null | undefined ) {
		
		if ( input === null || input === undefined ) {
			if ( !this.required ) {
				this.parts.setValue( {
					                     start: null,
					                     end: null,
				                     } );
				
				this.startChangeValue();
				return;
			}
		}
		
		const start = this.dateService.unixToLocal( input?.start );
		const end = this.dateService.unixToLocal( input?.end );
		
		this.parts.setValue( {
			                     start: start,
			                     end: end,
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
	
	private changeValue( val: DateRange | null | undefined ) {
		
		this._lastValue = val;
		this.runChangeValue( val );
	}
	
	get empty() {
		const inputElement1 = this._elementRef.nativeElement.childNodes[ 0 ].childNodes[ 0 ] as HTMLInputElement;
		const inputElement2 = this._elementRef.nativeElement.childNodes[ 0 ].childNodes[ 1 ] as HTMLInputElement;
		return this.value === null && inputElement1.value === '' && inputElement2.value === '';
	}
	
	writeValue( value: DateRange | null ): void {
		this.value = value;
	}
}
