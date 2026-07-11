import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

// Shape of the (optional) request bodies the mock handlers read. All fields are optional because
// the same body type is shared across the different mock endpoints.
interface MockRequestBody {
	search?: string;
	field?: string;
	value?: string;
	email?: string;
	confirmed?: boolean;
	firstName?: string;
	lastName?: string;
	page?: number;
	pageSize?: number;
	_page?: number;
	_pageSize?: number;
	_sort?: string;
	_sortDir?: string;
	_search?: string;
}

// Poll-Zähler für den Waiting-Dialog: die Demo simuliert einen Job, der nach einigen Polls fertig ist.
let dialogWaitingPolls = 0;

export const mockApiInterceptor: HttpInterceptorFn = ( req, next ) => {

	// Only intercept API calls
	if ( !req.url.includes( '/api/' ) ) {
		return next( req );
	}

	// Error API — always fails, to demo the differentiated error message + retry button.
	if ( req.url.includes( 'Test/Error/Fail' ) ) {
		return throwError( () => new HttpErrorResponse( {
			status: 500,
			error: { error: 'Server konnte die Daten nicht laden' },
			statusText: 'Internal Server Error',
		} ) ).pipe( delay( 400 ) );
	}

	// Stepper API
	if ( req.url.includes( 'Test/Stepper/Step' ) ) {
		return of( new HttpResponse( { status: 200, body: getStepperResponse( req.body as MockRequestBody ) } ) );
	}

	// Search Select API
	if ( req.url.includes( 'Test/Search/Select' ) ) {
		return of( new HttpResponse( { status: 200, body: getSearchSelectResponse( req.body as MockRequestBody ) } ) );
	}

	// Wait API (simulates delay)
	if ( req.url.includes( 'Test/Wait/Wait' ) ) {
		return of( new HttpResponse( { status: 200, body: [] } ) ).pipe( delay( 2000 ) );
	}

	// Tabs2 Table APIs
	if ( req.url.includes( '/api/tabs2/' ) ) {
		const type = req.url.split( '/api/tabs2/' )[ 1 ];
		return of( new HttpResponse( { status: 200, body: getTableResponse( type, req.body as MockRequestBody ) } ) );
	}

	// DynPage routes
	if ( req.url.includes( 'Home/Login/Test' ) ) {
		return of( new HttpResponse( { status: 200, body: getLoginTestPage() } ) );
	}

	// Dialog of type 'component': renders an arbitrary core.Component (here: expansion) as dialog content.
	// Mirrors the backend flow of dialog.NewDialogComponent(...) -> GET returns {type:'component', content:{...}}.
	if ( req.url.includes( 'Test/Test/DialogComponent' ) ) {
		return of( new HttpResponse( { status: 200, body: getDialogComponentResponse() } ) );
	}

	// DialogForm: a standard edit form. Submit (POST) simulates a short save and completes.
	if ( req.url.includes( 'Test/Test/DialogForm' ) ) {
		if ( req.method === 'POST' )
			return of( new HttpResponse( { status: 200, body: { done: true } } ) ).pipe( delay( 800 ) );
		return of( new HttpResponse( { status: 200, body: getDialogFormResponse() } ) );
	}

	// DialogLoading: form whose submit takes ~15s — showcases the in-dialog loading state
	// (form stays visible but greyed out, spinner replaces the action buttons).
	if ( req.url.includes( 'Test/Test/DialogLoading' ) ) {
		if ( req.method === 'POST' )
			return of( new HttpResponse( { status: 200, body: { done: true } } ) ).pipe( delay( 15000 ) );
		return of( new HttpResponse( { status: 200, body: getDialogLoadingResponse() } ) );
	}

	// DialogTable: a read-only table rendered inside a dialog.
	if ( req.url.includes( 'Test/Test/DialogTable' ) ) {
		return of( new HttpResponse( { status: 200, body: getDialogTableResponse() } ) );
	}

	// DialogDelete: a confirm (question) dialog. Confirm (POST) simulates the delete and completes.
	if ( req.url.includes( 'Test/Test/DialogDelete' ) ) {
		if ( req.method === 'POST' )
			return of( new HttpResponse( { status: 200, body: { done: true } } ) ).pipe( delay( 800 ) );
		return of( new HttpResponse( { status: 200, body: getDialogDeleteResponse() } ) );
	}

	// DialogWaiting: a long-running job. Opening (GET .../0) shows a spinner; the dialog then
	// polls (GET .../poll) on the interval until the job reports done (after a few polls).
	if ( req.url.includes( 'Test/Test/DialogWaiting' ) ) {
		if ( req.url.includes( '/poll' ) ) {
			dialogWaitingPolls++;
			const finished = dialogWaitingPolls >= 3;
			return of( new HttpResponse( { status: 200, body: finished ? { done: true, url: 'Test/Test/Dialogs' } : { done: false } } ) ).pipe( delay( 1200 ) );
		}
		dialogWaitingPolls = 0;
		return of( new HttpResponse( { status: 200, body: getDialogWaitingResponse() } ) );
	}

	if ( req.url.includes( 'Test/Test/Dialogs' ) ) {
		return of( new HttpResponse( { status: 200, body: getDialogsPage() } ) );
	}

	if ( req.url.includes( 'Test/Test/Home' ) ) {
		return of( new HttpResponse( { status: 200, body: getTestHomePage() } ) );
	}

	if ( req.url.includes( 'Test/Query/Page' ) ) {
		return of( new HttpResponse( { status: 200, body: getQueryPage() } ) );
	}

	if ( req.url.includes( 'Test/Group/Table' ) ) {
		return of( new HttpResponse( { status: 200, body: getGroupTablePage() } ) );
	}

	if ( req.url.includes( 'Test/Group/GroupData' ) ) {
		return of( new HttpResponse( { status: 200, body: getGroupTableData( req.body as MockRequestBody ) } ) );
	}

	if ( req.url.includes( 'Test/Form/Page' ) ) {
		return of( new HttpResponse( { status: 200, body: getFormPage() } ) );
	}

	// Server-side table data
	if ( req.url.includes( 'Test/Table/ServerData' ) ) {
		return of( new HttpResponse( { status: 200, body: getServerTableData( req.body as MockRequestBody ) } ) ).pipe( delay( 300 ) );
	}

	// Auto-refresh / poll demo: simulates a background worker that finishes over a few cycles.
	// While any job is still running the response carries "poll" (ms); once all jobs are done
	// the field is omitted and the frontend stops polling automatically.
	if ( req.url.includes( 'Test/Worker/TableData' ) ) {
		return of( new HttpResponse( { status: 200, body: getWorkerTableData() } ) ).pipe( delay( 200 ) );
	}

	// Self-polling button demo: the start call returns a poll response with a status URL;
	// the button then polls the status endpoint until it reports completion (no poll).
	if ( req.url.includes( 'Test/Worker/Start' ) ) {
		buttonWorkerTick = 0;
		return of( new HttpResponse( { status: 200, body: {
			done: true, poll: 2000, pollUrl: 'Test/Worker/Status', text: 'läuft… 0 %',
			message: 'Worker gestartet', messageType: 'info',
		} } ) ).pipe( delay( 200 ) );
	}
	if ( req.url.includes( 'Test/Worker/Status' ) ) {
		return of( new HttpResponse( { status: 200, body: getButtonWorkerStatus() } ) ).pipe( delay( 200 ) );
	}

	// Table data endpoints for Test/Test/Home
	if ( req.url.includes( 'Test/Test/Table1Data' ) ) {
		return of( new HttpResponse( { status: 200, body: getTable1Data( req.body as MockRequestBody ) } ) );
	}

	if ( req.url.includes( 'Test/Test/Table2Data' ) ) {
		return of( new HttpResponse( { status: 200, body: getTable2Data( req.body as MockRequestBody ) } ) );
	}

	// Query result table
	if ( req.url.includes( 'Test/Query/Table' ) ) {
		return of( new HttpResponse( { status: 200, body: getQueryTableResult() } ) );
	}

	// Inline Edit Options (simulates backend delay for remote options loading)
	if ( req.url.includes( 'Test/InlineEdit/Options' ) ) {
		return of( new HttpResponse( {
			status: 200,
			body: [
				{ value: 'Active', label: 'Active' },
				{ value: 'Discontinued', label: 'Discontinued' },
				{ value: 'On Sale', label: 'On Sale' },
			]
		} ) ).pipe( delay( 1000 ) );
	}

	// Inline Edit server-side search (simulates a large remote, searchable list)
	if ( req.url.includes( 'Test/InlineEdit/Search' ) ) {
		const body = req.body as MockRequestBody;
		const search = String( body?.search ?? '' ).toLowerCase();
		const categories = [
			'Computers', 'Laptops', 'Desktops', 'Monitors', 'Peripherals', 'Keyboards', 'Mice',
			'Storage', 'SSD', 'HDD', 'Audio', 'Headphones', 'Speakers', 'Cables', 'Adapters',
			'Networking', 'Routers', 'Webcams', 'Power', 'Accessories', 'Furniture', 'Lighting',
		].map( c => ( { value: c, label: c } ) );
		const filtered = search
			? categories.filter( o => o.label.toLowerCase().includes( search ) )
			: categories.slice( 0, 8 );
		return of( new HttpResponse( { status: 200, body: filtered } ) ).pipe( delay( 400 ) );
	}

	// Inline Edit Save (simulates backend delay)
	if ( req.url.includes( 'Test/InlineEdit/Save' ) ) {
		const body = req.body as MockRequestBody;

		// Simulate validation error for non-numeric price values
		if ( body?.field === 'price' && isNaN( Number( String( body?.value ).replace( /,/g, '' ) ) ) ) {
			return throwError( () => new HttpErrorResponse( {
				status: 400,
				statusText: 'Bad Request',
				error: { error: 'Price must be a valid number' }
			} ) ).pipe( delay( 500 ) );
		}

		const updates: Record<string, unknown> = {
			[ String( body?.field ) ]: body?.value,
			lastModified: new Date().toLocaleString( 'de-DE' ),
		};
		return of( new HttpResponse( {
			status: 200,
			body: {
				done: true,
				updates,
				message: 'Saved: ' + body?.field + ' = ' + body?.value,
				messageType: 'success',
			}
		} ) ).pipe( delay( 1000 ) );
	}

	// Pass through other requests
	return next( req );
};

// Stepper mock responses
function getStepperResponse( body: MockRequestBody ): unknown {

	// Step 0 -> Step 1: Return contact fields
	if ( !body?.email ) {
		return {
			step: 1,
			fields: [
				{ id: 'email', type: 'text', subtype: 'email', name: 'Email', required: true },
				{ id: 'phone', type: 'text', name: 'Phone' }
			],
			buttons: [
				{ text: 'Back', type: 'basic', action: 'prev' },
				{ text: 'Next', type: 'raised', action: 'next', default: true, color: 'primary' }
			]
		};
	}

	// Step 1 -> Step 2: Return summary/confirm
	if ( !body?.confirmed ) {
		const name = ( body?.firstName ?? '' ) + ' ' + ( body?.lastName ?? '' );
		return {
			step: 2,
			fields: [
				{ id: 'summary', type: 'info', name: 'Review: ' + name.trim() + ', ' + body.email },
				{ id: 'confirmed', type: 'checkbox', name: 'I confirm this is correct', required: true }
			],
			buttons: [
				{ text: 'Back', type: 'basic', action: 'prev' },
				{ text: 'Submit', type: 'raised', action: 'next', default: true, color: 'primary' }
			]
		};
	}

	// Final step: Navigate away
	return { goto: '/Workflow' };
}

// Search Select mock responses
function getSearchSelectResponse( body: MockRequestBody ): unknown[] {

	const search = body?.search ?? '';
	if ( search === '' ) {
		return [];
	}

	// Generate test data
	const data = [];
	for ( let i = 10; i < 16; i++ ) {
		data.push( { id: i, name: 'test ' + i } );
	}
	for ( let i = 20; i < 26; i++ ) {
		data.push( { id: i, name: 'test ' + i } );
	}

	// Filter by search term
	return data.filter( item => item.name.includes( search ) );
}

// Table mock responses
function getTableResponse( type: string, body: MockRequestBody ): unknown {

	const page = body?.page ?? 0;
	const pageSize = body?.pageSize ?? 10;
	const search = body?.search ?? '';

	// Generate mock data based on type
	const typeLabel = type.charAt( 0 ).toUpperCase() + type.slice( 1 );
	const statuses = [ 'Active', 'Pending', 'Completed', 'Cancelled' ];

	let allData = [];
	for ( let i = 1; i <= 50; i++ ) {
		allData.push( {
			id: i,
			name: `${ typeLabel } Item ${ i }`,
			date: `2024-0${ ( i % 9 ) + 1 }-${ ( i % 28 ) + 1 < 10 ? '0' : '' }${ ( i % 28 ) + 1 }`,
			status: statuses[ i % 4 ]
		} );
	}

	// Apply search filter
	if ( search ) {
		allData = allData.filter( item =>
			item.name.toLowerCase().includes( search.toLowerCase() ) ||
			item.status.toLowerCase().includes( search.toLowerCase() )
		);
	}

	// Apply pagination
	const total = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return { data, total };
}

// DynPage mock responses
function getLoginTestPage(): unknown {
	return {
		bread: null,
		data: [
			{
				type: 'buttonline',
				data: {
					class: '',
					buttons: [
						{ text: 'Login', type: 'flat', action: 'link', url: '/Home/Login/Login', color: 'primary' },
						{ text: 'Logout', type: 'flat', action: 'link', url: '/Home/Login/Logout' },
						{ text: 'API', type: 'flat', action: 'api', url: 'Home/Login/Send', color: 'primary' }
					]
				}
			}
		]
	};
}

function getDialogsPage(): unknown {
	return {
		bread: null,
		data: [
			{
				type: 'buttonline',
				data: {
					class: '',
					buttons: [
						{ text: 'DialogTable (sm)', type: 'raised', action: 'dialog', url: 'Test/Test/DialogTable', size: 'sm' },
						{ text: 'DialogForm (lg)', type: 'raised', action: 'dialog', url: 'Test/Test/DialogForm', size: 'lg' },
						{ text: 'DialogWaiting (xl)', type: 'raised', action: 'dialog', url: 'Test/Test/DialogWaiting/0', size: 'xl' },
						{ text: 'DialogDelete (full)', type: 'raised', action: 'dialog', url: 'Test/Test/DialogDelete', size: 'full' },
						{ text: 'DialogComponent (lg)', type: 'raised', action: 'dialog', url: 'Test/Test/DialogComponent', size: 'lg' },
						{ text: 'DialogLoading (15s)', type: 'raised', action: 'dialog', url: 'Test/Test/DialogLoading', size: 'md' }
					]
				}
			}
		]
	};
}

// Dialog content for the 'component' dialog type: an expansion accordion with three
// independently collapsible panels (read-only detail view). The `content` object is exactly
// what core.Component.Print() produces on the backend ({type, display, data}).
function getDialogComponentResponse(): unknown {
	const addressTable = ( name: string, street: string, city: string ) =>
		`<table style="width:100%;border-collapse:collapse">
			<tr><td style="padding:4px 8px;color:#888">Name</td><td style="padding:4px 8px">${ name }</td></tr>
			<tr><td style="padding:4px 8px;color:#888">Street</td><td style="padding:4px 8px">${ street }</td></tr>
			<tr><td style="padding:4px 8px;color:#888">City</td><td style="padding:4px 8px">${ city }</td></tr>
		</table>`;

	return {
		header: 'Order #4711 — Details',
		type: 'component',
		content: {
			type: 'expansion',
			display: null,
			data: {
				multi: true,
				panels: [
					{
						title: 'Delivery Address',
						icon: 'local_shipping',
						expanded: true,
						data: [ { type: 'html', data: { html: addressTable( 'Jane Doe', 'Main Street 1', '1010 Vienna' ) } } ]
					},
					{
						title: 'Billing Address',
						icon: 'receipt_long',
						expanded: false,
						data: [ { type: 'html', data: { html: addressTable( 'ACME GmbH', 'Industrial Park 7', '4020 Linz' ) } } ]
					},
					{
						title: 'Order Items',
						icon: 'inventory_2',
						expanded: false,
						data: [ { type: 'html', data: {
							html: `<table style="width:100%;border-collapse:collapse">
								<tr><th style="text-align:left;padding:4px 8px">Item</th><th style="text-align:right;padding:4px 8px">Qty</th></tr>
								<tr><td style="padding:4px 8px">Widget A</td><td style="text-align:right;padding:4px 8px">3</td></tr>
								<tr><td style="padding:4px 8px">Widget B</td><td style="text-align:right;padding:4px 8px">1</td></tr>
							</table>`
						} } ]
					}
				]
			}
		},
		buttons: [
			{ text: 'Close', type: 'raised', action: 'close', color: 'primary' }
		]
	};
}

// Dialog content for the 'form' dialog type: a typical edit form. The submit button uses an
// unhandled action ('save'), so clickButton() POSTs the form values to the dialog url.
function getDialogFormResponse(): unknown {
	return {
		header: 'Kontakt bearbeiten',
		type: 'form',
		url: 'Test/Test/DialogForm',
		model: { name: 'Jane Doe', email: 'jane@example.com', role: 2, active: true },
		fields: [
			{ id: 'name', type: 'text', name: 'Name', required: true },
			{ id: 'email', type: 'text', subtype: 'email', name: 'E-Mail' },
			{ id: 'role', type: 'select', name: 'Rolle', search: false, list: [
				{ id: 1, name: 'Admin' }, { id: 2, name: 'User' }, { id: 3, name: 'Gast' }
			] },
			{ id: 'note', type: 'textarea', name: 'Notiz', rows: 3 },
			{ id: 'active', type: 'bool', name: 'Aktiv' }
		],
		buttons: [
			{ text: 'Abbrechen', type: 'basic', action: 'close' },
			{ text: 'Speichern', type: 'raised', action: 'save', default: true, color: 'primary' }
		]
	};
}

// Dialog content that demonstrates the in-dialog loading state: the POST handler delays ~15s,
// during which the form is greyed out and a spinner replaces the action buttons.
function getDialogLoadingResponse(): unknown {
	return {
		header: 'Langer Vorgang (≈15 s)',
		type: 'form',
		url: 'Test/Test/DialogLoading',
		fields: [
			{ id: 'info', type: 'info', value: 'Beim Absenden wird ein Server-Vorgang von etwa 15 Sekunden simuliert. Währenddessen bleibt das Formular sichtbar (ausgegraut) und in der Button-Zeile erscheint ein Spinner anstelle der Buttons.' },
			{ id: 'comment', type: 'text', name: 'Kommentar', value: 'Demo' }
		],
		buttons: [
			{ text: 'Abbrechen', type: 'basic', action: 'close' },
			{ text: 'Absenden (≈15 s)', type: 'raised', action: 'submit', default: true, color: 'primary' }
		]
	};
}

// Dialog content for the 'table' dialog type: a read-only XiriRawTable.
function getDialogTableResponse(): unknown {
	return {
		header: 'Bestellpositionen — #4711',
		type: 'table',
		content: {
			showHeader: true,
			fields: [
				{ id: 'item', name: 'item', header: 'Artikel' },
				{ id: 'qty', name: 'qty', header: 'Menge', align: 'right' },
				{ id: 'price', name: 'price', header: 'Einzelpreis', align: 'right' }
			],
			data: [
				{ item: 'Widget A', qty: 3, price: '€ 29,90' },
				{ item: 'Widget B', qty: 1, price: '€ 149,00' },
				{ item: 'Versand', qty: 1, price: '€ 5,90' }
			]
		},
		buttons: [
			{ text: 'Schließen', type: 'raised', action: 'close', color: 'primary' }
		]
	};
}

// Dialog content for the 'question' dialog type: a confirm/delete prompt. The confirm button
// uses an unhandled action ('delete'), so clickButton() POSTs to the dialog url.
function getDialogDeleteResponse(): unknown {
	return {
		header: 'Eintrag löschen',
		type: 'question',
		url: 'Test/Test/DialogDelete',
		content: {
			icon: 'warning',
			iconColor: 'warn',
			value: 'Möchten Sie „Order #4711" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
		},
		buttons: [
			{ text: 'Abbrechen', type: 'basic', action: 'close' },
			{ text: 'Löschen', type: 'raised', action: 'delete', default: true, color: 'warn' }
		]
	};
}

// Dialog content for the 'waiting' dialog type: a spinner with status text. `url` points to the
// poll endpoint and `time` is the poll interval; the dialog GET-polls until the job is done.
function getDialogWaitingResponse(): unknown {
	return {
		header: 'Bericht wird erstellt',
		type: 'waiting',
		url: 'Test/Test/DialogWaiting/poll',
		time: 1200,
		content: { text: 'Der Bericht wird generiert, bitte warten…' },
		buttons: []
	};
}

function getTestHomePage(): unknown {
	return {
		bread: null,
		data: [
			{
				type: 'table',
				data: {
					url: 'Test/Test/Table1Data',
					fields: [
						{ id: 'id', name: 'ID', type: 'number' },
						{ id: 'name', name: 'Name', type: 'text' },
						{ id: 'status', name: 'Status', type: 'text' }
					],
					options: {
						title: 'Table 1',
						pagination: true,
						search: true,
						sort: true
					}
				}
			},
			{
				type: 'table',
				data: {
					url: 'Test/Test/Table2Data',
					fields: [
						{ id: 'id', name: 'ID', type: 'number' },
						{ id: 'name', name: 'Name', type: 'text' },
						{ id: 'date', name: 'Date', type: 'text' }
					],
					options: {
						title: 'Table 2',
						pagination: true,
						search: true
					}
				}
			}
		]
	};
}

function getQueryPage(): unknown {
	return {
		bread: 'Query',
		data: [
			{
				type: 'query',
				data: {
					fields: [],
					buttonline: {
						type: 'buttonline',
						data: {
							class: 'center',
							buttons: [
								{ text: 'Test', type: 'raised', action: 'api', url: 'Test/Query/Table', color: 'primary', autoLoad: true }
							]
						}
					}
				}
			}
		]
	};
}

function getGroupTablePage(): unknown {
	return {
		bread: null,
		data: [
			{
				type: 'table',
				data: {
					url: 'Test/Group/GroupData',
					fields: [
						{ id: 'id', name: 'ID', type: 'number' },
						{ id: 'name', name: 'Name', type: 'text' },
						{ id: 'info', name: 'Info', type: 'text' },
						{ id: 'grp', name: 'Group', type: 'text' }
					],
					options: {
						title: 'Groups',
						pagination: true,
						search: true,
						sort: true,
						select: true,
						selectButtons: [
							{ text: 'Edit', type: 'flat', action: 'dialog', url: 'Test/Group/MultiEdit' },
							{ text: 'Delete', type: 'flat', action: 'dialog', url: 'Test/Group/MultiDel', color: 'warn' }
						]
					}
				}
			}
		]
	};
}

function getGroupTableData( body: MockRequestBody ): unknown {
	const page = body?.page ?? 0;
	const pageSize = body?.pageSize ?? 10;
	const search = body?.search ?? '';

	let allData = [];
	for ( let i = 1; i <= 30; i++ ) {
		allData.push( {
			id: i,
			name: `Group ${ i }`,
			info: `Description for group ${ i }`,
			grp: `Parent ${ ( i % 5 ) + 1 }`
		} );
	}

	if ( search ) {
		allData = allData.filter( item =>
			item.name.toLowerCase().includes( search.toLowerCase() ) ||
			item.info.toLowerCase().includes( search.toLowerCase() )
		);
	}

	const total = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return { data, total };
}

function getFormPage(): unknown {
	return {
		bread: null,
		data: [
			{
				type: 'form',
				data: {
					url: 'Test/Form/Page',
					header: 'Test Form',
					fields: [
						{ id: 'name', type: 'text', name: 'Name', required: true },
						{ id: 'file', type: 'file', name: 'File', hint: 'Maximum 10MB', required: false, multiple: true, pattern: '.pdf,.jpg' }
					],
					buttons: [
						{ text: 'Submit', type: 'raised', action: 'next', default: true, color: 'primary' },
						{ text: 'Cancel', type: 'basic', action: 'back' }
					]
				}
			}
		]
	};
}

function getTable1Data( body: MockRequestBody ): unknown {
	const page = body?.page ?? 0;
	const pageSize = body?.pageSize ?? 10;
	const search = body?.search ?? '';
	const statuses = [ 'Active', 'Pending', 'Completed', 'Cancelled' ];

	let allData = [];
	for ( let i = 1; i <= 25; i++ ) {
		allData.push( {
			id: i,
			name: `Item ${ i }`,
			status: statuses[ i % 4 ]
		} );
	}

	if ( search ) {
		allData = allData.filter( item =>
			item.name.toLowerCase().includes( search.toLowerCase() ) ||
			item.status.toLowerCase().includes( search.toLowerCase() )
		);
	}

	const total = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return { data, total };
}

function getTable2Data( body: MockRequestBody ): unknown {
	const page = body?.page ?? 0;
	const pageSize = body?.pageSize ?? 10;
	const search = body?.search ?? '';

	let allData = [];
	for ( let i = 1; i <= 20; i++ ) {
		allData.push( {
			id: i,
			name: `Record ${ i }`,
			date: `2024-0${ ( i % 9 ) + 1 }-${ ( i % 28 ) + 1 < 10 ? '0' : '' }${ ( i % 28 ) + 1 }`
		} );
	}

	if ( search ) {
		allData = allData.filter( item =>
			item.name.toLowerCase().includes( search.toLowerCase() )
		);
	}

	const total = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return { data, total };
}

// Background-worker simulation state for the auto-refresh (poll) demo.
// Each POST advances one "tick"; jobs finish after their individual duration.
let workerTick = 0;
const workerDurations = [ 2, 3, 4 ]; // ticks until each job completes

function getWorkerTableData(): unknown {
	workerTick++;

	const jobs = [ 'Import Job', 'Report Generation', 'Data Sync' ];
	let anyRunning = false;

	const data = jobs.map( ( name, idx ) => {
		const total = workerDurations[ idx ];
		const done = workerTick >= total;
		if ( !done )
			anyRunning = true;
		const pct = Math.min( 100, Math.round( ( workerTick / total ) * 100 ) );
		return {
			id: idx + 1,
			name,
			status: done
				? [ { label: 'Fertig', color: 'success' } ]
				: [ { label: `läuft… ${ pct }%`, color: 'warn' } ],
		};
	} );

	const body: Record<string, unknown> = { data };
	if ( anyRunning ) {
		body.poll = 2000; // keep polling while a worker is still running
	} else {
		workerTick = 0; // reset so the manual reload button restarts the demo
	}
	return body;
}

// Self-polling button: status endpoint that reports "running" for a few ticks, then "done".
// Only the final response carries a message (so polling ticks don't spam snackbars).
let buttonWorkerTick = 0;
const buttonWorkerTotal = 3;

function getButtonWorkerStatus(): unknown {
	buttonWorkerTick++;
	if ( buttonWorkerTick < buttonWorkerTotal ) {
		const pct = Math.round( ( buttonWorkerTick / buttonWorkerTotal ) * 100 );
		return { done: true, poll: 2000, pollUrl: 'Test/Worker/Status', text: `läuft… ${ pct } %` };
	}
	buttonWorkerTick = 0; // reset so the button can start over
	return {
		done: true,
		message: 'Worker fertig', messageType: 'success',
		button: { text: 'Erledigt ✓', color: 'success' },
	};
}

function getServerTableData( body: MockRequestBody ): unknown {

	const page = body?._page ?? 0;
	const pageSize = body?._pageSize ?? 10;
	const sortField = body?._sort ?? '';
	const sortDir = body?._sortDir ?? 'asc';
	const search = body?._search ?? '';

	const departments = [ 'Engineering', 'Sales', 'Marketing', 'Support', 'HR', 'Finance' ];
	const statuses = [ 'Active', 'Inactive', 'On Leave', 'Sick' ];
	const cities = [ 'Vienna', 'Berlin', 'Munich', 'Zurich', 'Hamburg', 'Frankfurt' ];

	type ServerRow = Record<string, string | number | ( string | number )[]>;
	let allData: ServerRow[] = [];
	for ( let i = 1; i <= 87; i++ ) {
		allData.push( {
			id: i,
			name: `Employee ${ i }`,
			department: departments[ i % departments.length ],
			city: cities[ i % cities.length ],
			status: statuses[ i % statuses.length ],
			salary: [ `${ ( 2500 + i * 150 ).toLocaleString( 'de-DE' ) }`, 2500 + i * 150 ],
		} );
	}

	if ( search ) {
		allData = allData.filter( item =>
			String( item.name ).toLowerCase().includes( search.toLowerCase() ) ||
			String( item.department ).toLowerCase().includes( search.toLowerCase() ) ||
			String( item.city ).toLowerCase().includes( search.toLowerCase() ) ||
			String( item.status ).toLowerCase().includes( search.toLowerCase() )
		);
	}

	if ( sortField && sortField !== '' ) {
		allData.sort( ( a, b ) => {
			let valA: string | number | ( string | number )[] = a[ sortField ];
			let valB: string | number | ( string | number )[] = b[ sortField ];
			if ( Array.isArray( valA ) ) valA = valA[ 1 ];
			if ( Array.isArray( valB ) ) valB = valB[ 1 ];
			if ( typeof valA === 'string' ) valA = valA.toLowerCase();
			if ( typeof valB === 'string' ) valB = valB.toLowerCase();
			const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
			return sortDir === 'desc' ? -cmp : cmp;
		} );
	}

	const totalCount = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return {
		data,
		fields: [
			{ id: 'id', name: 'ID' },
			{ id: 'name', name: 'Name' },
			{ id: 'department', name: 'Department' },
			{ id: 'city', name: 'City' },
			{ id: 'status', name: 'Status' },
			{ id: 'salary', name: 'Salary', format: 'number', align: 'right', textSuffix: ' EUR' },
		],
		totalCount
	};
}

function getQueryTableResult(): unknown {
	return {
		bread: null,
		data: [
			{
				type: 'table',
				data: {
					url: 'Test/Test/Table1Data',
					fields: [
						{ id: 'id', name: 'ID', type: 'number' },
						{ id: 'name', name: 'Name', type: 'text' },
						{ id: 'status', name: 'Status', type: 'text' }
					],
					options: {
						title: 'Query Results',
						pagination: true,
						search: true
					}
				}
			}
		]
	};
}
