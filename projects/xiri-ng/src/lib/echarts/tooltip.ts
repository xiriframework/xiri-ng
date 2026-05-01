/** Escapes characters that would otherwise be interpreted as HTML in echarts tooltip strings. */
export function escapeHtml( s: string ): string {
	return String( s ?? '' )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' );
}
