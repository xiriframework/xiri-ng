import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	OnInit,
} from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	FormGroup,
	FormBuilder,
	FormsModule,
	ReactiveFormsModule
} from '@angular/forms';
import { MatFormFieldControl, MatSuffix } from '@angular/material/form-field';
import { XiriDateService } from "../../services/date.service";
import { XiriFormField } from "../field.interface";
import { MatOption } from "@angular/material/core";
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import {
	MatDatepickerInput,
	MatDatepickerToggle,
	MatDatepickerToggleIcon,
	MatDatepicker
} from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { XiriFieldMain } from "../helper/fieldmain";

interface DateForm {
	date: FormControl<Date | null>
	hour: FormControl<number>
	minute: FormControl<number>
}

let nextUniqueIdXiriDate = 0;


@Component( {
	            selector: 'xiri-date',
	            templateUrl: './date.component.html',
	            styleUrl: './date.component.scss',
	            host: {
		            '[id]': 'id',
		            '(focus)': 'focus()',
	            },
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [ {
		            provide: MatFormFieldControl,
		            useExisting: XiriDateComponent
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
export class XiriDateComponent extends XiriFieldMain implements OnInit,
                                                                ControlValueAccessor,
                                                                MatFormFieldControl<number | null | undefined> {
	
	protected _uid = `xiri-date-${ nextUniqueIdXiriDate++ }`;

	public minDate: Date | null = null;
	public maxDate: Date | null = null;

	parts: FormGroup<DateForm>;

	private _lastValue: number | null = null;
	public type: string = 'date';
	
	
	hours = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
	          '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
	          '20', '21', '22', '23' ];
	minutes = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
	            '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
	            '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
	            '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
	            '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
	            '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', ];
	
	private dateService = inject( XiriDateService );
	private fb = inject( FormBuilder );

	constructor() {
		super();

		this._id = this._uid;

		if ( this.ngControl != null )
			this.ngControl.valueAccessor = this;

		this.parts = this.fb.group<DateForm>( {
			                                      date: new FormControl<Date | null>( null ),
			                                      hour: new FormControl<number>( 0, { nonNullable: true } ),
			                                      minute: new FormControl<number>( 0, { nonNullable: true } ),
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
		
		this.type = value.subtype ? value.subtype : 'date';
		
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
	get value(): number | null | undefined {
		
		const { date, hour, minute } = this.parts.value;
		
		if ( !date && !this.required && !this.parts.valid )
			return this._disabled() ? null : undefined;
		if ( !date || hour === undefined || minute === undefined )
			return null;
		
		date.setHours( hour );
		date.setMinutes( minute );
		
		return this.dateService.dateToUnix( date );
	}
	
	set value( input: number | null | undefined ) {

		if ( input === null || input === undefined ) {
			if ( !this.required ) {
				this.parts.setValue( {
					                     date: null,
					                     hour: 0,
					                     minute: 0,
				                     } );

				this.startChangeValue();
				return;
			}
		}

		const current = this.dateService.unixToLocal( input );
		const hour = current?.getHours() ?? 0;
		const minute = current?.getMinutes() ?? 0;

		this.parts.setValue( {
			                     date: current,
			                     hour: hour,
			                     minute: minute,
		                     } );

		this.startChangeValue();
	}
	
	private runCheck(): void {
		
		if ( !this.ngControl )
			return;
		
		const val = this.value;
		if ( val === this._lastValue )
			this.stateChanges.next();
		else
			this.changeValue( val );
	}
	
	protected startChangeValue(): void {
		this.runChangeValue( this.value );
	}
	
	private changeValue( val: number | null | undefined ) {
		
		this._lastValue = val;
		this.runChangeValue( val );
	}
	
	override get empty() {
		const inputElement = this._elementRef.nativeElement.childNodes[ 0 ] as HTMLInputElement;
		return this.value === null && inputElement.value === '';
	}
	
	override writeValue( value: number | null ): void {
		this.value = value;
	}
}
