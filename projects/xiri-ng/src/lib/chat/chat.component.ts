import {
	afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, Injector, input, OnInit, signal,
	viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, exhaustMap, filter, fromEvent, interval, merge } from 'rxjs';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { XiriDataService } from '../services/data.service';
import { XiriLocaleService } from '../services/locale.service';
import { buildChatRows, XiriChatMsgRow } from './chat-rows';
import { XiriChatMessage, XiriChatPage, XiriChatSettings, XiriChatStatus } from './chat.types';

const STATUS_ICON: Record<XiriChatStatus, string> = {
	sending: 'schedule', sent: 'done', delivered: 'done_all', read: 'done_all', failed: 'error',
};

// Abstand zum unteren Rand, bis zu dem der Nutzer noch als "unten" gilt.
const BOTTOM_THRESHOLD = 40;

// 'initial' übernimmt cursor und hasOlder, 'update' (Poll/SSE) nur cursor, 'older' nur hasOlder.
type PageKind = 'initial' | 'update' | 'older';

export function chatQuery( url: string, key: string, value: string ): string {
	return url + ( url.includes( '?' ) ? '&' : '?' ) + key + '=' + encodeURIComponent( value );
}

@Component( {
	            selector: 'xiri-chat',
	            templateUrl: './chat.component.html',
	            styleUrl: './chat.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ CdkTextareaAutosize, MatButton, MatIconButton, MatIcon, MatProgressSpinner ]
            } )
export class XiriChatComponent implements OnInit {

	settings = input.required<XiriChatSettings>();

	protected readonly data = inject( XiriDataService );
	protected readonly locale = inject( XiriLocaleService );
	protected readonly destroyRef = inject( DestroyRef );
	protected readonly injector = inject( Injector );
	protected readonly scroller = viewChild.required<ElementRef<HTMLElement>>( 'scroller' );

	protected readonly statusIcon = STATUS_ICON;
	protected readonly labels = computed( () => this.locale.chatLabels() );
	protected readonly byId = signal( new Map<string, XiriChatMessage>() );
	// ponytail: "heute" wird nur bei neuen Nachrichten neu berechnet, nicht um Mitternacht.
	protected readonly rows = computed( () =>
		buildChatRows( [ ...this.byId().values() ], Math.floor( Date.now() / 1000 ), this.locale, this.labels() ) );
	protected readonly hasOlder = signal( false );
	protected readonly unseen = signal( false );
	protected readonly draft = signal( '' );
	// true nach dem ersten Scroll nach unten; erst dann darf der Wächter oben nachladen.
	protected readonly ready = signal( false );
	protected cursor = '';
	protected readonly loadingOlder = signal( false );
	private readonly sentinel = viewChild<ElementRef<HTMLElement>>( 'sentinel' );

	constructor() {
		// Ein neuer Observer pro Lauf: Nach jedem Nachladen meldet er den aktuellen Stand sofort. Ist der Wächter noch
		// sichtbar (kurzer Verlauf), lädt er so weiter, bis der Bereich gefüllt ist oder hasOlder false wird.
		effect( onCleanup => {
			const el = this.sentinel()?.nativeElement;
			if ( !el || !this.ready() || this.loadingOlder() || typeof IntersectionObserver === 'undefined' )
				return;
			const observer = new IntersectionObserver( entries => {
				if ( entries.some( e => e.isIntersecting ) )
					this.loadOlder();
			}, { root: this.scroller().nativeElement } );
			observer.observe( el );
			onCleanup( () => observer.disconnect() );
		} );
	}

	ngOnInit(): void {
		const s = this.settings();
		const start = ( page: XiriChatPage ) => {
			this.applyPage( page, 'initial' );
			this.startUpdates( s );
		};
		if ( s.messages )
			start( s );
		else
			// Scheitert die Startseite, laufen Poll/SSE trotzdem an: mit leerem Cursor liefert der Server die Startseite.
			this.data.get( s.url ).pipe( takeUntilDestroyed( this.destroyRef ) )
				.subscribe( { next: res => start( res as XiriChatPage ), error: () => this.startUpdates( s ) } );
	}

	protected submit(): void {
		const text = this.draft().trim();
		if ( !text )
			return;
		this.draft.set( '' );
		this.post( text, 'c-' + Date.now().toString( 36 ) + Math.random().toString( 36 ).slice( 2, 8 ) );
	}

	protected retry( msg: XiriChatMessage ): void {
		this.post( msg.text, msg.clientId ?? msg.id );
	}

	protected onKeydown( event: KeyboardEvent ): void {
		if ( event.key === 'Enter' && !event.shiftKey && !event.isComposing ) {
			event.preventDefault();
			this.submit();
		}
	}

	protected onInput( event: Event ): void {
		this.draft.set( ( event.target as HTMLTextAreaElement ).value );
	}

	protected onScroll(): void {
		if ( this.isAtBottom() )
			this.unseen.set( false );
	}

	protected scrollToBottom(): void {
		this.unseen.set( false );
		afterNextRender( {
			write: () => {
				const el = this.scroller().nativeElement;
				el.scrollTop = el.scrollHeight;
				this.ready.set( true );
			}
		}, { injector: this.injector } );
	}

	protected applyPage( page: XiriChatPage, kind: PageKind ): void {
		const atBottom = kind === 'initial' || this.isAtBottom();
		const before = this.byId().size;
		this.upsert( page.messages ?? [] );
		if ( kind !== 'older' && page.cursor !== undefined )
			this.cursor = page.cursor;
		if ( kind !== 'update' && page.hasOlder !== undefined )
			this.hasOlder.set( page.hasOlder );
		if ( kind === 'older' )
			return;
		if ( atBottom )
			this.scrollToBottom();
		else if ( this.byId().size > before )
			this.unseen.set( true );
	}

	protected upsert( messages: XiriChatMessage[] ): void {
		if ( !messages.length )
			return;
		this.byId.update( old => {
			const next = new Map( old );
			for ( const msg of messages ) {
				// Die Server-Nachricht ersetzt die optimistische, die unter ihrer clientId steht.
				if ( msg.clientId && msg.clientId !== msg.id )
					next.delete( msg.clientId );
				next.set( msg.id, msg );
			}
			return next;
		} );
	}

	protected isAtBottom(): boolean {
		const el = this.scroller().nativeElement;
		return el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
	}

	private startUpdates( s: XiriChatSettings ): void {
		if ( s.stream )
			this.openStream( s.stream );
		else if ( s.poll && s.poll > 0 )
			this.startPolling( s.url, s.poll );
	}

	// Leerer Cursor = es kam noch keine Startseite an, die Antwort zählt dann als Startseite.
	private pageKind(): PageKind {
		return this.cursor ? 'update' : 'initial';
	}

	private startPolling( url: string, seconds: number ): void {
		merge( interval( seconds * 1000 ), fromEvent( document, 'visibilitychange' ) ).pipe(
			filter( () => !document.hidden ),
			exhaustMap( () => this.data.get( chatQuery( url, 'cursor', this.cursor ) ).pipe( catchError( () => EMPTY ) ) ),
			takeUntilDestroyed( this.destroyRef ),
		).subscribe( res => this.applyPage( res as XiriChatPage, this.pageKind() ) );
	}

	private openStream( stream: string ): void {
		if ( typeof EventSource === 'undefined' )
			return;
		// Auth nur per Cookie: EventSource kann keine eigenen Header senden.
		const source = new EventSource( this.data.getConfigApi() + chatQuery( stream, 'cursor', this.cursor ), { withCredentials: true } );
		source.onmessage = event => {
			let page: XiriChatPage;
			try {
				page = JSON.parse( event.data ) as XiriChatPage;
			} catch {
				return; // kaputtes Event verwerfen, das nächste bringt den Stand mit
			}
			if ( page && typeof page === 'object' )
				this.applyPage( page, this.pageKind() );
		};
		this.destroyRef.onDestroy( () => source.close() );
	}

	private loadOlder(): void {
		const oldest = this.rows().find( ( r ): r is XiriChatMsgRow => r.kind === 'msg' );
		if ( !oldest || !this.hasOlder() || this.loadingOlder() )
			return;
		this.loadingOlder.set( true );
		// Nach Destroy keine Antwort mehr verarbeiten: applyPage/afterNextRender bräuchten die View.
		this.data.get( chatQuery( this.settings().url, 'before', oldest.msg.id ) ).pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( {
			next: res => {
				// Erst jetzt messen: Der Nutzer kann während des Requests gescrollt haben.
				const el = this.scroller().nativeElement;
				const fromBottom = el.scrollHeight - el.scrollTop;
				this.applyPage( res as XiriChatPage, 'older' );
				// Scrollposition halten: Der Inhalt wächst oben, der Abstand zum unteren Rand bleibt gleich.
				afterNextRender( {
					write: () => {
						el.scrollTop = el.scrollHeight - fromBottom;
						this.loadingOlder.set( false );
					}
				}, { injector: this.injector } );
			},
			error: () => {
				// Kein Endlos-Retry: Der Observer würde sofort wieder auslösen.
				this.hasOlder.set( false );
				this.loadingOlder.set( false );
			},
		} );
	}

	private post( text: string, clientId: string ): void {
		this.upsert( [ { id: clientId, clientId, text, time: Math.floor( Date.now() / 1000 ), own: true, status: 'sending' } ] );
		this.scrollToBottom();
		this.data.post( this.settings().url, { text, clientId } ).subscribe( {
			next: res => {
				const msg = ( res as { message?: XiriChatMessage } | null )?.message;
				if ( msg )
					this.upsert( [ { ...msg, clientId } ] );
				else
					this.setStatus( clientId, 'sent' );
			},
			error: () => this.setStatus( clientId, 'failed' ),
		} );
	}

	private setStatus( id: string, status: XiriChatStatus ): void {
		const msg = this.byId().get( id );
		if ( msg )
			this.upsert( [ { ...msg, status } ] );
	}
}
