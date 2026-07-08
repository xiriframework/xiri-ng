interface XiriStorageEntry {
	time: number;
	value: unknown;
}

/**
 * Shared implementation for the local- and session-storage services. Internal
 * (not part of the public API); the concrete XiriLocalStorageService and
 * XiriSessionStorageService differ only in which Storage backend they pass in.
 */
export abstract class XiriStorageServiceBase {

	private data: Record<string, XiriStorageEntry> = {};

	protected constructor( private readonly storage?: Storage ) {
	}

	public clear() {

		this.data = {};
		this.storage?.clear();
	}

	public set( name: string, value: unknown ) {

		const val = {
			time: Date.now(),
			value: value,
		}

		this.data[ name ] = val;
		this.storage?.setItem( name, JSON.stringify( val ) );
	}

	private getStruct( name: string ): XiriStorageEntry | null {

		if ( this.data[ name ] )
			return this.data[ name ];

		const valstr = this.storage?.getItem( name );
		if ( valstr ) {
			const val = JSON.parse( valstr ) as XiriStorageEntry;
			this.data[ name ] = val;
			return val;
		}

		return null;
	}

	public remove( name: string ) {

		delete this.data[ name ];
		this.storage?.removeItem( name );
	}

	public get( name: string ): unknown {

		const val = this.getStruct( name );
		if ( !val )
			return null;

		return val.value;
	}

	/**
	 * @param name
	 * @param maxTime in seconds
	 */
	public getTimeout( name: string, maxTime: number ): unknown {

		const val = this.getStruct( name );
		if ( !val )
			return null;

		if ( val.time < Date.now() - maxTime * 1000 ) {
			this.remove( name );
			return null;
		}

		return val.value;
	}

}
