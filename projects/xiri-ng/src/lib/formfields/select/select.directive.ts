import { ChangeDetectorRef, Directive, effect, inject, input, OnInit, OnDestroy } from "@angular/core";
import { AbstractControl, UntypedFormControl } from "@angular/forms";
import {
	catchError,
	debounceTime,
	of,
	ReplaySubject,
	Subject,
	switchMap,
	tap
} from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { XiriFormFieldSelectOption } from "../field.interface";
import { XiriDataService } from "../../services/data.service";

export type XiriSelectPredicate = ( filter: string, element: XiriFormFieldSelectOption ) => boolean;
export const DEFAULT_PREDICATE: XiriSelectPredicate = ( filter: string,
                                                        el: XiriFormFieldSelectOption ): boolean => el.name.toLowerCase()
	                                                                                                    .indexOf(
		                                                                                                    filter ) >
                                                                                                    -1;

export type XiriSelectCompare = ( a: XiriFormFieldSelectOption, b: XiriFormFieldSelectOption ) => boolean;
export const DEFAULT_COMPARE: XiriSelectCompare = ( a: XiriFormFieldSelectOption,
                                                    b: XiriFormFieldSelectOption ) => a && b && a.id === b.id;

@Directive( {
	            selector: "[xiriSelect]",
	            exportAs: "xiriSelect"
            } )
export class XiriSelectDirective implements OnInit, OnDestroy {
	private dataService = inject( XiriDataService );
	private cdr = inject( ChangeDetectorRef );
	
	get formControl() {
		return this._filterFormControl;
	}
	
	get filter() {
		return this._filteredValuesSubject.asObservable();
	}
	
	/** control for the MatSelect filter keyword multi-selection */
	private _filterFormControl: UntypedFormControl = new UntypedFormControl();
	
	/** list of _allValues filtered by search keyword */
	private _filteredValuesSubject: ReplaySubject<XiriFormFieldSelectOption[]> = new ReplaySubject<XiriFormFieldSelectOption[]>(
		1
	);

	/** what the panel currently shows — the basis for the select-all toggle */
	private _filtered: XiriFormFieldSelectOption[] = [];

	private emit( list: XiriFormFieldSelectOption[] ) {
		this._filtered = list;
		this._filteredValuesSubject.next( list );
	}
	
	/** indicate search operation is in progress */
	public searching = false;
	
	// @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
	
	/** Subject that emits when the component has been destroyed. */
	protected _onDestroy = new Subject<void>();
	
	
	predicate = input<XiriSelectPredicate>(DEFAULT_PREDICATE);

	compare = input<XiriSelectCompare>(DEFAULT_COMPARE);

	serverSideSearch = input<boolean>(false);

	serverUrl = input<string>('');

	serverParams = input<Record<string, unknown>>({});

	/** list of _allValues */
	private _allValues: XiriFormFieldSelectOption[] = [] as XiriFormFieldSelectOption[];
	values = input<XiriFormFieldSelectOption[]>([]);

	constructor() {
		effect(() => {
			let value = this.values();
			if ( value === undefined )
				value = [];

			this._allValues = value;
			this.emit( this._allValues.slice() );
		});
	}

	ngOnInit() {
		if ( this.serverSideSearch() ) {
			this._filterFormControl.valueChanges
				.pipe(
					filter( search => !!search ),
					tap( () => this.searching = true ),
					debounceTime( 200 ),
					switchMap( ( search: string ) => {
						return this.dataService.post( this.serverUrl(),
						                              {
							                              ...this.serverParams(),
							                              search: search
						                              } )
							.pipe(
								catchError( ( err ) => {
									console.log( 'catch 1', err );
									return of( [] );
								} ) )
					} ),
					tap( ( filteredList ) => {
						this.emit( this._allValues.slice().concat( filteredList as XiriFormFieldSelectOption[] ) );
					} ),
					tap( () => {
						this.searching = false;
						this.cdr.markForCheck();
					} ),
					takeUntil( this._onDestroy ),
				).subscribe();
		} else {
			this._filterFormControl.valueChanges
				.pipe( takeUntil( this._onDestroy ) )
				.subscribe( () => {
					this.searching = true;
					this.applyFilter();
					this.searching = false;
					this.cdr.markForCheck();
				} );
		}

	}
	
	ngOnDestroy() {
		this._onDestroy.next();
		this._onDestroy.complete();
	}
	
	private applyFilter() {
		if ( !this._allValues ) {
			return;
		}
		// get the search keyword
		let search = this._filterFormControl.value;
		if ( !search ) {
			this.emit( this._allValues.slice() );
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the _allValues
		this.emit( this._allValues.filter( el => this.predicate()( search, el ) ) );
	}
	
	// ---- select all / none (ngx-mat-select-search toggle-all checkbox) ----
	// Contract: "visible" = what the panel currently shows (_filtered). Disabled and group
	// options are never toggled; already selected disabled options survive a "none".

	private selectableIds(): Set<unknown> {
		return new Set( this._filtered.filter( o => !o.disabled && !o.isGroup ).map( o => o.id ) );
	}

	private static ids( value: unknown ): unknown[] {
		return Array.isArray( value ) ? value : [];
	}

	/** false when nothing is selectable — the checkbox is hidden then, otherwise MatCheckbox would stay checked after a no-op click */
	hasSelectable(): boolean {
		return this.selectableIds().size > 0;
	}

	allSelected( value: unknown ): boolean {
		const sel = this.selectableIds();
		const cur = new Set( XiriSelectDirective.ids( value ) );
		return sel.size > 0 && [ ...sel ].every( id => cur.has( id ) );
	}

	someSelected( value: unknown ): boolean {
		const sel = this.selectableIds();
		const cur = new Set( XiriSelectDirective.ids( value ) );
		const hits = [ ...sel ].filter( id => cur.has( id ) ).length;
		return hits > 0 && hits < sel.size;
	}

	toggleSelectAll( selectAll: boolean, control: AbstractControl | null ) {
		if ( !control || control.disabled )
			return;
		const sel = this.selectableIds();
		const cur = XiriSelectDirective.ids( control.value );
		const next = selectAll
			? cur.concat( [ ...sel ].filter( id => !cur.includes( id ) ) )
			: cur.filter( id => !sel.has( id ) );
		if ( next.length === cur.length && next.every( ( id, i ) => id === cur[ i ] ) )
			return;
		control.setValue( next );
		control.markAsDirty();
		control.markAsTouched();
	}
}
