import { compileString } from 'sass';

// Kompiliert das Grid-Mixin (styles/grid.scss) und hängt es einmalig an document.head, damit jsdom die Grid-Regeln
// kennt. Der relative loadPath wird von sass gegen process.cwd() aufgelöst (Repo-Root bei ng test).
export function injectGridStyles(): void {
	if ( document.getElementById( 'xiri-grid-styles' ) )
		return;
	const style = document.createElement( 'style' );
	style.id = 'xiri-grid-styles';
	style.textContent = compileString( '@use \'grid\'; @include grid.grid();', { loadPaths: [ 'projects/xiri-ng/styles' ] } ).css;
	document.head.appendChild( style );
}

// Der Runner läuft mit isolate: false, der Style würde sonst in spätere Specs desselben Workers hineinragen.
export function removeGridStyles(): void {
	document.getElementById( 'xiri-grid-styles' )?.remove();
}
