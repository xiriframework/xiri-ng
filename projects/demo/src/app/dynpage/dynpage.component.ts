import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable, Subscription } from "rxjs";
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { XiriDynComponentComponent } from '../../../../xiri-ng/src/lib/dyncomponent/dyncomponent.component';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { XiriDataService } from "../../../../xiri-ng/src/lib/services/data.service";
import { XiriBreadcrumbItem } from "../../../../xiri-ng/src/lib/breadcrumb/breadcrumb.component";
import { DemoPageComponent } from "../demo-page/demo-page.component";
import { XiriDynData } from "../../../../xiri-ng/src/lib/dyncomponent/dyndata.interface";

interface DynPageResponse {
	bread: unknown;
	data: XiriDynData[];
}

@Component( {
	            selector: 'app-dynpage',
	            templateUrl: './dynpage.component.html',
	            imports: [ MatProgressSpinner, XiriDynComponentComponent, DemoPageComponent ]
            } )
export class DynpageComponent implements OnInit, OnDestroy {
	
	private dataService: XiriDataService = inject( XiriDataService );
	private router: Router = inject( Router );
	private route: ActivatedRoute = inject( ActivatedRoute );
	
	public loading = signal( true );
	public data = signal<XiriDynData[]>( [] );
	public bread = signal<unknown>( null );
	// The mock backend sends null or a plain string too; only an array is a breadcrumb.
	public breadArray = computed( () => Array.isArray( this.bread() ) ? this.bread() as XiriBreadcrumbItem[] : null );
	private subs: Subscription = new Subscription();
	public error = signal( false );
	
	constructor() {
		this.router.events.pipe(
			filter( ( event: Event ) => event instanceof NavigationEnd ),
			takeUntilDestroyed()
		).subscribe( () => {
			this.load();
		} );
	}
	
	ngOnInit() {
		this.load();
	}
	
	private load() {
		
		this.loading.set( true );
		this.data.set( [] );
		this.bread.set( null );
		this.error.set( false );
		
		let url = this.router.url;
		if ( url.lastIndexOf( '/', 0 ) === 0 )
			url = url.substring( 1 );
		
		let call: Observable<unknown>;
		if ( Object.keys( this.route.snapshot.queryParams ).length === 0 )
			call = this.dataService.get( url );
		else
			call = this.dataService.post( url, this.route.snapshot.queryParams );

		this.subs.add( call.subscribe(
			{
				next: ( res ) => {
					const response = res as DynPageResponse;
					this.bread.set( response.bread );
					this.data.set( response.data );
					this.loading.set( false );
				},
				error: ( err ) => {
					console.log( 'dynpage onreject', err );
					this.error.set( true );
					this.loading.set( false );
				}
			}
		) );
	}
	
	ngOnDestroy() {
		this.subs.unsubscribe();
	}
	
}

