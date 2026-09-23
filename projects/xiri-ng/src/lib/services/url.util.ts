// window.location.href wird von Angular nicht sanitisiert: javascript:/data: würden im Seitenkontext laufen.
export function isSafeHref( url: string ): boolean {
	try {
		return [ 'http:', 'https:', 'mailto:', 'tel:' ].includes( new URL( url, window.location.href ).protocol );
	} catch {
		return false;
	}
}
