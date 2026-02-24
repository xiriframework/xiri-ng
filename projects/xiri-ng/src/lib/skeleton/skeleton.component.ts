import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type XiriSkeletonType = 'text' | 'circle' | 'rect' | 'table-row';

@Component( {
	            selector: 'xiri-skeleton',
	            templateUrl: './skeleton.component.html',
	            styleUrl: './skeleton.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            host: { 'role': 'status', 'aria-label': 'Laden...', '[class.fill]': 'fill()' }
            } )
export class XiriSkeletonComponent {

	type = input<XiriSkeletonType>( 'text' );
	width = input<string>( '100%' );
	height = input<string>( '1em' );
	lines = input<number>( 1 );
	columns = input<number>( 4 );
	animate = input<boolean>( true );
	fill    = input<boolean>( false );

	linesArray = computed( () => Array.from( { length: this.lines() } ) );
	columnsArray = computed( () => Array.from( { length: this.columns() } ) );
}
