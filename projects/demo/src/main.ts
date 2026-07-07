import { importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';
import { provideXiriServices } from '../../xiri-ng/src/public-api';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { AppRoutes } from './app/app-routing.module';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { mockApiInterceptor } from "./app/mock/mock-api.interceptor";
import { LayoutModule } from "@angular/cdk/layout";
import { provideRouter, withRouterConfig } from "@angular/router";


bootstrapApplication( AppComponent, {
	providers: [
		provideZonelessChangeDetection(),
		importProvidersFrom(
			LayoutModule
		),
		provideDateFnsAdapter(),
		provideHttpClient( withFetch(), withInterceptors( [ mockApiInterceptor ] ) ),
		provideXiriServices( { api: '/api/' } ),
		provideRouter( AppRoutes, withRouterConfig( { onSameUrlNavigation: 'reload' } ) )
	]
} )
	.catch( err => console.error( err ) );
