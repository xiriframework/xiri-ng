import { defaultXiriDataServiceConfig, XiriDataServiceConfig } from "./services/data.service";
import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";

const configuredRegistries = new WeakSet<MatIconRegistry>();

export type XiriServicesConfig = Partial<XiriDataServiceConfig> & {
	/**
	 * Default font set class for `<mat-icon>` without `fontSet`, defaults to `material-symbols-outlined`.
	 * `null` (or `''`) leaves it to Angular Material's own detection.
	 */
	iconFontSet?: string | null;
};

export function provideXiriServices( config: XiriServicesConfig ): EnvironmentProviders {
	const { iconFontSet = 'material-symbols-outlined', ...dataConfig } = config;
	const merged = { ...defaultXiriDataServiceConfig, ...dataConfig };

	return makeEnvironmentProviders( [
		                                 {
			                                 provide: XiriDataServiceConfig,
			                                 useValue: merged,
		                                 },
		                                 provideEnvironmentInitializer( () => {
			                                 // The registry is root-wide: the first call (the app config) decides, even with null;
			                                 // a lazy route calling provideXiriServices again must not reset it.
			                                 const registry = inject( MatIconRegistry );
			                                 if ( configuredRegistries.has( registry ) )
				                                 return;
			                                 configuredRegistries.add( registry );
			                                 if ( iconFontSet )
				                                 registry.setDefaultFontSetClass( iconFontSet, 'mat-ligature-font' );
		                                 } )
	                                 ] );
}
