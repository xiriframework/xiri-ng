import { defaultXiriDataServiceConfig, XiriDataServiceConfig } from "./services/data.service";
import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";

/**
 * @param config.iconFontSet default font set class for `<mat-icon>` without `fontSet`.
 *   Defaults to `material-symbols-outlined`; `null` leaves it to Angular Material's own detection.
 */
export function provideXiriServices(
	config: Partial<XiriDataServiceConfig> & { iconFontSet?: string | null }
): EnvironmentProviders {
	const { iconFontSet = 'material-symbols-outlined', ...dataConfig } = config;
	const merged = { ...defaultXiriDataServiceConfig, ...dataConfig };

	return makeEnvironmentProviders( [
		                                 {
			                                 provide: XiriDataServiceConfig,
			                                 useValue: merged,
		                                 },
		                                 provideEnvironmentInitializer( () => {
			                                 if ( iconFontSet )
				                                 inject( MatIconRegistry ).setDefaultFontSetClass( iconFontSet, 'mat-ligature-font' );
		                                 } )
	                                 ] );
}
