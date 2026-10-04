import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { appProviders } from './app/app.config';

bootstrapApplication( AppComponent, { providers: appProviders } )
	.catch( err => console.error( err ) );
