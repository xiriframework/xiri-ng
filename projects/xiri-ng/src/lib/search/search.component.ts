import {
	ChangeDetectionStrategy,
	Component,
	effect,
	ElementRef,
	input,
	OnDestroy,
	OnInit,
	output,
	viewChild
} from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from "rxjs";
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';

@Component( {
	            selector: 'xiri-search',
	            templateUrl: './search.component.html',
	            styleUrls: [ './search.component.scss' ],
	            host: {
		            '(document:keydown.escape)': 'onKeydownHandler()'
	            },
	            imports: [
		            FormsModule,
		            CdkTrapFocus,
		            MatIconButton,
		            MatIcon,
	            ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriSearchComponent implements OnInit, OnDestroy {

	changed = output<string>();
	placeholder = input<string>( '' );
	
	open = input<boolean>( false );
	reset = input<number>( -1 );
	escape = input<boolean>( true );
	focus = input<number>( -1 );
	
	private _search = viewChild<ElementRef>( 'search' );
	
	private subs: Subscription = new Subscription();
	private filter: Subject<string> = new Subject<string>();
	
	public _text: string = '';
	public show: boolean = false;
	
	constructor() {
		
		effect( () => {
			let num = this.reset();
			if ( num != -1 ) {
				this.show = this.open();
				this._text = '';
				this.filter.next( this._text );
			}
		} );
		effect( () => {
			let num = this.focus();
			if ( num != -1 ) {
				this.show = true;
				this._search()?.nativeElement.focus();
			}
		} );
		effect( () => {
			const value = this.text();
			if ( value ) {
				this._text = value;
				this.show = true;
				this.filter.next( this._text );
			}
		} );
	}
	
	ngOnInit(): void {
		this.subs.add( this.filter.pipe( debounceTime( 200 ), distinctUntilChanged() )
			               .subscribe( value => {
				               this.changed.emit( value );
			               } ) );
		
		if ( this.open() )
			this.show = true;
	}
	
	onKeydownHandler() {
		
		if ( this.escape() && this.show ) {
			this.show = this.open() ? true : !this.show;
			this._text = '';
			this.filter.next( this._text );
		}
	}
	
	text = input<string>( '' );
	
	searchDo() {
		this.filter.next( this._text );
	}
	
	ngOnDestroy(): void {
		this.subs.unsubscribe();
	}
	
	click(): void {
		this.show = this.open() ? true : !this.show;
		this._text = '';
		
		this.filter.next( this._text );
	}
	
}
