import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	OnInit,
	ViewChild,
} from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	FormsModule,
	ReactiveFormsModule
} from '@angular/forms';
import { MatFormFieldControl, MatSuffix } from '@angular/material/form-field';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import {
	MatDatepicker,
	MatDatepickerInput,
	MatDatepickerToggle,
	MatDatepickerToggleIcon
} from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { XiriDateService } from '../../services/date.service';
import { XiriFormField } from '../field.interface';
import { XiriFieldMain } from '../helper/fieldmain';

let nextUniqueIdXiriYearMonth = 0;

export const XIRI_YEAR_MONTH_FORMATS = {
	parse:   { dateInput: 'MM.yyyy' },
	display: {
		dateInput:           'MM.yyyy',
		monthYearLabel:      'MMM yyyy',
		dateA11yLabel:       'LL',
		monthYearA11yLabel:  'MMMM yyyy',
	},
};

@Component( {
	            selector:        'xiri-yearmonth',
	            templateUrl:     './yearmonth.component.html',
	            styleUrl:        './yearmonth.component.scss',
	            host: {
		            '[id]':    'id',
		            '(focus)': 'focus()',
	            },
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers:       [
		            { provide: MatFormFieldControl, useExisting: XiriYearMonthComponent },
		            { provide: MAT_DATE_FORMATS,    useValue:    XIRI_YEAR_MONTH_FORMATS },
	            ],
	            imports: [
		            FormsModule,
		            ReactiveFormsModule,
		            MatInput,
		            MatDatepickerInput,
		            MatDatepickerToggle,
		            MatSuffix,
		            MatIcon,
		            MatDatepickerToggleIcon,
		            MatDatepicker,
	            ]
            } )
export class XiriYearMonthComponent extends XiriFieldMain implements OnInit,
                                                                     ControlValueAccessor,
                                                                     MatFormFieldControl<number | null | undefined> {

	protected _uid = `xiri-yearmonth-${ nextUniqueIdXiriYearMonth++ }`;

	public minDate: Date | null = null;
	public maxDate: Date | null = null;

	dateControl = new FormControl<Date | null>( null );

	@ViewChild( 'picker' ) picker?: MatDatepicker<Date>;

	private _lastValue: number | null = null;
	public type: string = 'yearmonth';

	private dateService = inject( XiriDateService );

	constructor() {
		super();
		this._id = this._uid;

		if ( this.ngControl != null )
			this.ngControl.valueAccessor = this;
	}

	ngOnInit() {
		this.subs.add( this.dateControl.valueChanges.subscribe( () => {
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
		this.disabled ? this.dateControl.disable() : this.dateControl.enable();

		this.stateChanges.next();
	}

	@Input()
	get value(): number | null | undefined {
		const date = this.dateControl.value;

		if ( !date && !this.required && !this.dateControl.valid )
			return this._disabled() ? null : undefined;
		if ( !date )
			return null;

		return this.dateService.dateToUnix( date );
	}

	set value( input: number | null | undefined ) {
		if ( input === null || input === undefined ) {
			if ( !this.required ) {
				this.dateControl.setValue( null );
				this.startChangeValue();
				return;
			}
		}

		const current = this.dateService.unixToLocal( input );

		if ( current ) {
			current.setDate( 1 );
			current.setHours( 0, 0, 0, 0 );
		}

		this.dateControl.setValue( current );
		this.startChangeValue();
	}

	onYearMonthSelected( date: Date ): void {
		const normalized = new Date( date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0 );
		this.dateControl.setValue( normalized );
		this.picker?.close();
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
		return this.dateControl.value === null;
	}

	override writeValue( value: number | null ): void {
		this.value = value;
	}
}
