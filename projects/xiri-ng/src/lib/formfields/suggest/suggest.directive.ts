import { computed, DestroyRef, Directive, effect, inject, input, OnInit, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroupDirective } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteActivatedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { catchError, concat, map, of, Subject, switchMap, timer } from 'rxjs';
import { XiriFormField, XiriFormFieldSelectOption } from '../field.interface';
import { XiriDataService } from '../../services/data.service';

/**
 * Vorschläge für ein Textfeld (mat-autocomplete): `field.list` wird lokal gefiltert, bei `field.url`
 * wird beim Tippen nachgeladen (POST {search, <searchWith-Felder>} -> [{id, name}]). Freie Eingabe
 * bleibt immer erlaubt - die Directive schreibt nie ins Control, sie liefert nur `options()`.
 *
 * Bewusst über DOM-Events statt control.valueChanges: form-fields tauscht Controls bei Formular-
 * ersetzung aus, die Directive überlebt dank `track field.id` - ein gegriffenes Control wäre alt.
 *
 * Hängt am selben Input ein MatAutocompleteTrigger, hält die Directive außerdem die Pfeil-Markierung über
 * Listenänderungen hinweg (siehe onActivated).
 */
@Directive( {
	selector: 'input[xiriSuggest]',
	exportAs: 'xiriSuggest',
	host: { '(input)': 'onInput( $event )', '(focus)': 'onFocus( $event )' },
} )
export class XiriSuggestDirective implements OnInit {
	field = input.required<XiriFormField>( { alias: 'xiriSuggest' } );

	private search = signal( '' );
	private remote = signal<XiriFormFieldSelectOption[]>( [] );
	/** Jeder next() startet die Remote-Kette neu und bricht die vorige ab. */
	private typed$ = new Subject<string>();
	private dataService = inject( XiriDataService );
	/** Das formGroup von form-fields; optional, damit die Directive auch an einem nackten Input läuft. */
	private formGroupDir = inject( FormGroupDirective, { optional: true } );
	private trigger = inject( MatAutocompleteTrigger, { self: true, optional: true } );
	private destroyRef = inject( DestroyRef );
	/** Text der per Pfeil markierten Option. Tippen und Schließen des Panels heben die Markierung auf. */
	private marked: string | null = null;

	/** Was das Panel zeigt: lokale Treffer, dann Servertreffer, nach name dedupliziert. */
	options = computed( () => {
		const needle = this.search().toLowerCase();
		const local = cleanOptions( this.field().list ).filter( o => !needle || o.name.toLowerCase().includes( needle ) );
		const seen = new Set<string>();
		return local.concat( this.remote() ).filter( o => {
			if ( seen.has( o.name ) )
				return false;
			seen.add( o.name );
			return true;
		} );
	} );

	constructor() {
		this.typed$.pipe(
			switchMap( s => {
				const url = this.field().url;
				if ( !url || !s )
					return of( [] as XiriFormFieldSelectOption[] );
				// Alte Treffer sofort weg, dann warten, dann fragen - neue Eingabe bricht alles davor ab.
				// Kontextwerte erst im Timer-Zweig lesen: eine Änderung innerhalb der 200 ms geht mit.
				return concat( of( [] as XiriFormFieldSelectOption[] ), timer( 200 ).pipe(
					switchMap( () => this.dataService.post( url, { ...this.contextValues(), search: s } ).pipe(
						map( cleanOptions ),
						catchError( () => of( [] as XiriFormFieldSelectOption[] ) ) ) ) ) );
			} ),
			takeUntilDestroyed(),
		).subscribe( r => this.remote.set( r ) );

		// Feldwechsel (Patch-Klon, Formularersetzung mit gleicher ID): der Text des alten Formulars darf
		// nie gegen die neue url laufen. Alles zurücksetzen, nichts suchen - der nächste Fokus oder
		// Tastendruck richtet den Filter neu aus.
		effect( () => {
			this.field();
			untracked( () => this.reset( '' ) );
		} );
	}

	ngOnInit(): void {
		const auto = this.trigger?.autocomplete;
		if ( !auto )
			return;
		auto.optionActivated.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( e => this.onActivated( auto, e ) );
		auto.closed.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( () => this.marked = null );
	}

	// Material löscht die Markierung bei jeder Änderung der Optionsliste. Treffen Servertreffer erst nach dem Pfeil
	// ein (langsame Leitung), nähme Enter sonst den getippten Teiltext. Darum die Markierung per Text zurückholen.
	// ponytail: nutzt MatAutocomplete._keyManager (intern), bei einem Material-Update mit den Specs prüfen.
	private onActivated( auto: MatAutocomplete, event: MatAutocompleteActivatedEvent ): void {
		if ( event.option ) {
			this.marked = event.option.viewValue;
			return;
		}
		if ( this.marked === null )
			return;
		const index = auto.options.toArray().findIndex( o => o.viewValue === this.marked );
		if ( index >= 0 )
			auto._keyManager.setActiveItem( index );
		else
			this.marked = null;
	}

	onInput( event: Event ): void {
		this.marked = null;
		const value = ( event.target as HTMLInputElement ).value;
		this.search.set( value );
		this.typed$.next( value );
	}

	/** Fokus richtet den lokalen Filter am sichtbaren Wert aus und verwirft bei geändertem Wert alte
	 *  Servertreffer - ohne Request: form-fields fokussiert auch programmatisch. */
	onFocus( event: Event ): void {
		const value = ( event.target as HTMLInputElement ).value;
		if ( value !== this.search() )
			this.reset( value );
	}

	private reset( search: string ): void {
		this.search.set( search );
		this.typed$.next( '' ); // leerer Text -> of([]) im switchMap: bricht ab und leert remote
	}

	/** Aktuelle Werte der searchWith-Felder (flache Schlüssel, nur enabled), zur Request-Zeit gelesen. */
	private contextValues(): Record<string, unknown> {
		// Nicht form.value: bei komplett deaktivierter Gruppe enthält das auch deaktivierte Kinder.
		const controls = this.formGroupDir?.form.controls ?? {};
		const values: Record<string, unknown> = {};
		for ( const id of this.field().searchWith ?? [] ) {
			const control = controls[ id ];
			if ( control?.enabled )
				values[ id ] = control.value;
		}
		return values;
	}
}

/** Server und Liste sind Trust-Boundary: nur Objekte mit String-name kommen durch. */
function cleanOptions( value: unknown ): XiriFormFieldSelectOption[] {
	return Array.isArray( value )
		? ( value as unknown[] ).filter( ( o ): o is XiriFormFieldSelectOption =>
			!!o && typeof ( o as XiriFormFieldSelectOption ).name === 'string' )
		: [];
}
