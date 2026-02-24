import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable, Subscription } from "rxjs";
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { XiriDynComponentComponent } from '../../../../xiri-ng/src/lib/dyncomponent/dyncomponent.component';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { XiriDataService } from "../../../../xiri-ng/src/lib/services/data.service";
import { XiriDynData } from "../../../../xiri-ng/src/lib/dyncomponent/dyndata.interface";

@Component( {
	            selector: 'app-dynpage',
	            templateUrl: './dynpage.component.html',
	            styleUrls: [ './dynpage.component.scss' ],
	            imports: [ MatProgressSpinner, XiriDynComponentComponent ]
            } )
export class DynpageComponent implements OnInit, OnDestroy {
	
	private dataService: XiriDataService = inject( XiriDataService );
	private router: Router = inject( Router );
	private route: ActivatedRoute = inject( ActivatedRoute );
	
	public loading = true;
	public data = signal<XiriDynData[] | null>( null );
	public bread = null;
	private subs: Subscription = new Subscription();
	public error = false;
	
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
		
		this.loading = true;
		this.data.set( null );
		this.bread = null;
		this.error = false;
		
		let url = this.router.url;
		if ( url.lastIndexOf( '/', 0 ) === 0 )
			url = url.substring( 1 );
		
		let call: Observable<any>;
		if ( Object.keys( this.route.snapshot.queryParams ).length === 0 )
			call = this.dataService.get( url );
		else
			call = this.dataService.post( url, this.route.snapshot.queryParams );
		
		this.subs.add( call.subscribe(
			{
				next: ( res: any ) => {
					this.bread = res.bread;
					this.data.set( res.data );
					this.loading = false;
				},
				error: ( err ) => {
					console.log( 'dynpage onreject', err );
					this.error = true;
					this.loading = false;
				}
			}
		) );
	}
	
	ngOnDestroy() {
		this.subs.unsubscribe();
	}
	
}

