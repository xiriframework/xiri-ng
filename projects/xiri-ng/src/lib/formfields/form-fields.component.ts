import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, inject, input, OnDestroy, OnInit, output } from '@angular/core';
import {
	AbstractControl,
	FormsModule,
	ReactiveFormsModule,
	UntypedFormBuilder,
	UntypedFormGroup,
	ValidationErrors,
	ValidatorFn,
	Validators
} from '@angular/forms';
import { XiriFormField, XiriFormFieldCondition } from './field.interface';
import { Observable, Subscription } from "rxjs";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { XiriFileComponent } from './file/file.component';
import { XiriTimelimitComponent } from './timelimit/timelimit.component';
import { XiriVolumeComponent } from './volume/volume.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { XiriDateTimeRangeComponent } from './datetimerange/datetimerange.component';
import { XiriDateRangeComponent } from './daterange/daterange.component';
import { XiriDateComponent } from './date/date.component';
import { XiriTreeselectComponent } from './treeselect/treeselect.component';
import { XiriSelectDirective } from './select/select.directive';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MatError, MatFormField, MatHint, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { SafehtmlPipe } from "../pipes/safehtml.pipe";
import { XiriChipsComponent } from './chips/chips.component';

export type XiriFormFieldDisplay = 'full' | 'line' | 'small';


@Component( {
	            selector: 'xiri-form-fields',
	            templateUrl: './form-fields.component.html',
	            styleUrl: './form-fields.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [
		            FormsModule,
		            ReactiveFormsModule,
		            MatFormField,
		            MatLabel,
		            MatInput,
		            MatPrefix,
		            MatSuffix,
		            MatIcon,
		            MatHint,
		            MatError,
		            MatIconButton,
		            MatSelect,
		            MatOption,
		            NgxMatSelectSearchModule,
		            XiriSelectDirective,
		            XiriTreeselectComponent,
		            XiriDateComponent,
		            XiriDateRangeComponent,
		            XiriDateTimeRangeComponent,
		            MatCheckbox,
		            XiriVolumeComponent,
		            XiriTimelimitComponent,
		            XiriFileComponent,
		            MatProgressSpinner,
		            AsyncPipe,
		            SafehtmlPipe,
		            XiriChipsComponent,
	            ]
            } )
export class XiriFormFieldsComponent implements OnInit, OnDestroy {
	
	private formBuilder = inject( UntypedFormBuilder );
	protected _changeDetectorRef = inject( ChangeDetectorRef );
	
	form = input<XiriFormField[] | null>( null );
	display = input<XiriFormFieldDisplay>( 'full' );
	formChange = output<any>();
	check = input<Observable<void>>( null );
	
	// fields: XiriFormField[] = [];
	formGroup: UntypedFormGroup;
	private subs: Subscription = new Subscription();
	private lastValue: any = null;
	private _fields: XiriFormField[] | null = null;
	private _fieldsLoaded: boolean = false;
	private _initialEmitDone: boolean = false;

	constructor() {

		this.formGroup = this.formBuilder.group( {} );

		// Track form input changes and emit after controls are created
		effect( () => {
			const formInput = this.form();
			if ( formInput !== null ) {
				// Force evaluation of computed to create controls
				this.fields();
				// Schedule emission for next microtask to ensure view is ready
				if ( this._fieldsLoaded && !this._initialEmitDone ) {
					this._initialEmitDone = true;
					// Use queueMicrotask to emit after current change detection cycle
					queueMicrotask( () => {
						this.formChange.emit( this.formGroup );
					} );
				}
			}
		} );
	}
	
	ngOnInit(): void {
		
		this.subs.add( this.check()?.subscribe( () => {
			this.validateAllFormFields();
		} ) );
		
		this.subs.add( this.formGroup.valueChanges.subscribe( () => {
			if ( this._fieldsLoaded ) {
				if ( JSON.stringify( this.formGroup.value ) === this.lastValue )
					return;
				this.lastValue = JSON.stringify( this.formGroup.value );
				this.formChange.emit( this.formGroup );
			}
		} ) );
	}

	fields = computed( () => {

		this._fieldsLoaded = false;
		if ( this._fields !== null ) {
			for ( let i = 0; i != this._fields.length; i++ ) {
				this.formGroup.removeControl( this._fields[ i ].id );
			}
			this._fields = null;
		}

		let fields = this.form();
		if ( fields == null ) {
			return null;
		}

		this._fields = fields;

		this.createControl();

		this.lastValue = JSON.stringify( this.formGroup.value );
		this._fieldsLoaded = true;
		return this._fields;
	} );
	
	private createControl(): void {
		
		for ( let i = 0; i != this._fields.length; i++ ) {
			const field = this._fields[ i ];
			
			if ( field.formtype )
				field.type = field.formtype;
			if ( !field.subtype )
				field.subtype = field.type;
			if ( !field.class )
				field.class = 'xcol';
			
			switch ( field.type ) {
				case 'email':
					field.type = 'text';
					field.subtype = 'email';
					break;
				
				case 'password':
					field.subtype = 'password';
					field.pwdhide = true;
					break;
				
				case 'objectlist':
					field.multiple = true;
					if ( field.subtype != 'objectlist' )
						field.type = field.subtype;
					else {
						if ( field.tree === undefined )
							field.tree = true;
						if ( field.required === undefined )
							field.required = true;
						field.type = 'treeselect';
					}
					break;
				
				case 'volume':
					field.required = true;
					break;
				
				case 'treeselect':
					field.tree = true;
					if ( field.required === undefined )
						field.required = true;
					break;
				
				case 'multiselect':
					field.tree = false;
					field.type = 'treeselect';
					
					if ( field.required === undefined )
						field.required = true;
					break;
				
				case 'select':
				case 'object':
				case 'model':
					if ( field.type == 'object' || field.type == 'model' ) {
						field.type = 'select';
						field.subtype = 'model';
						field.multiple = false;
					}
					if ( field.subtype == 'object' )
						field.subtype = 'model';
					
					if ( field.list === undefined && field.array !== undefined ) {
						field.list = [];
						field.array.forEach( val => {
							field.list.push( {
								                 id: val,
								                 name: val,
							                 } )
						} );
					}
					
					if ( field.subtype === 'model' ) {
						if ( field.value === undefined && field.list.length != 0 )
							field.value = field.list[ 0 ].id;
					} else {
						if ( field.value === undefined || field.value === null )
							field.value = [];
					}
					
					if ( field.required === undefined )
						field.required = true;
					
					field.serverSideSearch = !!field.url;
					
					break;
				
				case 'date':
				case 'datetime':
					field.type = 'date';
					if ( field.required === undefined )
						field.required = true;
					if ( field.subtype == 'datetime' )
						field.class += ' datetime';
					break;
				
				case 'daterange':
				case 'datetimerange':
					if ( field.required === undefined )
						field.required = true;
					break;
				
				case 'bool': // TODO
					if ( field.name === undefined && field.placeholder )
						field.name = field.placeholder;
					break;
				
				case 'question': // TODO
					if ( ( <any> field ).question )
						field.value = ( <any> field ).question;
					
					break;
			}
			
			// if ( field.hint || (field.type == 'textarea' && field.max) )
			//	field.class += ' hashint';
			
			if ( field.value === undefined ) {
				if ( field.type == 'text' || field.type == 'textarea' )
					field.value = '';
				else if ( field.type == 'bool' )
					field.value = false;
			}
			
			field.required = coerceBooleanProperty( field.required );
			field.disabled = coerceBooleanProperty( field.disabled );
			
			const control = this.formBuilder.control(
				field.value,
				this.bindValidations( field )
			);
			
			field.control = control;
			this.formGroup.addControl( field.id, control );
		}
	}
	
	private bindValidations( field: XiriFormField ) {
		
		const validList = [];
		
		if ( field.validations === undefined ) {
			
			field.validations = [];
			
			if ( field.min !== undefined ) {
				if ( field.type == 'number' || field.type == 'date' )
					field.validations.push( {
						                        id: 'min',
						                        validator: Validators.min( field.min ),
						                        message: 'Minimum not reached'
					                        } );
				else if ( field.type == 'daterange' || field.type == 'datetimerange' )
					field.validations.push( {
						                        id: 'min',
						                        validator: validatorDateRangeStart( field.min ),
						                        message: 'Check Minimum Date'
					                        } );
				else if ( field.type == 'multiselect' || field.type == 'treeselect' )
					field.validations.push( {
						                        id: 'min',
						                        validator: validatorArrayMin( field.min ),
						                        message: 'Minimum not reached'
					                        } );
				else
					field.validations.push( {
						                        id: 'min',
						                        validator: Validators.minLength( field.min ),
						                        message: 'Check Format'
					                        } );
			}
			if ( field.max !== undefined ) {
				if ( field.type == 'number' || field.type == 'date' )
					field.validations.push( {
						                        id: 'max',
						                        validator: Validators.max( field.max ),
						                        message: 'Maximum reached'
					                        } );
				else if ( field.type == 'daterange' || field.type == 'datetimerange' )
					field.validations.push( {
						                        id: 'max',
						                        validator: validatorDateRangeEnd( field.max ),
						                        message: 'Max Date reached'
					                        } );
				else if ( field.type == 'multiselect' || field.type == 'treeselect' )
					field.validations.push( {
						                        id: 'max',
						                        validator: validatorArrayMax( field.max ),
						                        message: 'Maximum reached'
					                        } );
				else
					field.validations.push( {
						                        id: 'max',
						                        validator: Validators.maxLength( field.max ),
						                        message: 'Maximum reached'
					                        } );
			}
			
			if ( field.pattern !== undefined ) {
				field.validations.push( {
					                        id: 'pattern',
					                        validator: Validators.pattern( field.pattern ),
					                        message: 'Check Format'
				                        } );
			} else {
				if ( field.type == 'text' && field.subtype == 'email' ) {
					field.validations.push( {
						                        id: 'email',
						                        validator: Validators.email,
						                        message: 'Check Format'
					                        } );
				}
			}
			
			if ( field.required == true ) {
				field.validations.push( {
					                        id: 'required',
					                        validator: Validators.required,
					                        message: 'Required',
				                        } );
			} else {
				field.validations.push( {
					                        id: 'undefined',
					                        validator: validatorUndefined(),
					                        message: 'Check Format',
				                        } );
			}
		}
		
		field.validations.forEach( valid => {
			validList.push( valid.validator );
		} );
		
		return validList.length ? Validators.compose( validList ) : null;
	}
	
	ngOnDestroy() {
		this.subs.unsubscribe();
	}

	private validateAllFormFields() {

		this.formGroup.markAsDirty();
		this.formGroup.markAllAsTouched();
		this._changeDetectorRef.detectChanges();
	}

	isFieldVisible( field: XiriFormField ): boolean {

		// Check if field is inside a collapsed section
		if ( this.isInCollapsedSection( field ) )
			return false;

		if ( !field.showWhen )
			return true;

		const conditions: XiriFormFieldCondition[] = Array.isArray( field.showWhen )
			? field.showWhen
			: [ field.showWhen ];

		return conditions.every( condition => this.evaluateCondition( condition ) );
	}

	toggleSection( header: XiriFormField ): void {
		header.collapsed = !header.collapsed;
		this._changeDetectorRef.detectChanges();
	}

	private isInCollapsedSection( field: XiriFormField ): boolean {
		const fields = this._fields;
		if ( !fields ) return false;

		const idx = fields.indexOf( field );
		if ( idx <= 0 ) return false;

		// Walk backwards to find the nearest header or divider
		for ( let i = idx - 1; i >= 0; i-- ) {
			const f = fields[ i ];
			if ( f.type === 'header' ) {
				return f.collapsible && f.collapsed;
			}
			if ( f.type === 'divider' ) {
				return false; // Divider breaks the section
			}
		}

		return false;
	}

	private evaluateCondition( condition: XiriFormFieldCondition ): boolean {

		const control = this.formGroup.get( condition.field );
		if ( !control )
			return false;

		const fieldValue = control.value;

		switch ( condition.operator ) {
			case 'equals':
				return fieldValue === condition.value;
			case 'notEquals':
				return fieldValue !== condition.value;
			case 'contains':
				return typeof fieldValue === 'string' && fieldValue.includes( condition.value );
			case 'greaterThan':
				return fieldValue > condition.value;
			case 'lessThan':
				return fieldValue < condition.value;
			case 'in':
				return Array.isArray( condition.value ) && condition.value.includes( fieldValue );
			case 'notEmpty':
				return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
			default:
				return true;
		}
	}
}

function validatorDateRangeStart( min: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === undefined || control.value === null || control.value.start === null )
			return null;
		const ok = min < control.value.start;
		return ok ? null : { min: { value: control.value } };
	};
}

function validatorDateRangeEnd( max: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === undefined || control.value === null || control.value.end === null )
			return null;
		const ok = max > control.value.end;
		return ok ? null : { max: { value: control.value } };
	};
}

function validatorUndefined(): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		return control.value === undefined ? { undefined: { value: control.value } } : null;
	};
}

function validatorArrayMin( min: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === null || control.value === undefined )
			return null;
		const ok = control.value.length >= min;
		return ok ? null : { min: { value: control.value } };
	};
}

function validatorArrayMax( max: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === null || control.value === undefined )
			return null;
		const ok = control.value.length <= max;
		return ok ? null : { max: { value: control.value } };
	};
}
