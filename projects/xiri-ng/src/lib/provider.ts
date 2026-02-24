import { defaultXiriDataServiceConfig, XiriDataServiceConfig } from "./services/data.service";
import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";

export function provideXiriServices(
	config: Partial<XiriDataServiceConfig>
): EnvironmentProviders {
	const merged = { ...defaultXiriDataServiceConfig, ...config };
	
	return makeEnvironmentProviders( [
		                                 {
			                                 provide: XiriDataServiceConfig,
			                                 useValue: merged,
		                                 }
	                                 ] );
}