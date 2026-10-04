import { EnvironmentProviders, importProvidersFrom, Provider, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withRouterConfig } from '@angular/router';
import { LayoutModule } from '@angular/cdk/layout';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { provideXiriServices } from '../../../xiri-ng/src/public-api';
import { AppRoutes } from './app-routing.module';
import { mockApiInterceptor } from './mock/mock-api.interceptor';

// Shared by main.ts and the demo tests, so the tests run against exactly the app's setup.
export const appProviders: ( Provider | EnvironmentProviders )[] = [
	provideZonelessChangeDetection(),
	importProvidersFrom( LayoutModule ),
	provideDateFnsAdapter(),
	provideHttpClient( withFetch(), withInterceptors( [ mockApiInterceptor ] ) ),
	provideXiriServices( { api: '/api/' } ),
	provideRouter( AppRoutes, withRouterConfig( { onSameUrlNavigation: 'reload' } ) ),
];
