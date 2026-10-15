import { XiriFormField } from 'projects/xiri-ng/src/lib/formfields/field.interface';

// Abnahme-Beispiel aus der Anforderung von tracking: Checkliste mit Positionen. Formular-Seite und Mock-Dialog
// nutzen dieselbe Definition.
export function checklistDemoFields(): XiriFormField[] {
	const items = [ 'Bremsen', 'Licht', 'Reifen', 'Spiegel', 'Hupe', 'Ladungssicherung', 'Planen', 'Kupplung', 'Tank',
	                'Warndreieck', 'Verbandskasten', 'Papiere' ];
	return [
		{ id: 'name', type: 'text', name: 'Name', required: true, value: 'Abfahrtskontrolle LKW' },
		{
			id: 'items', type: 'rows', name: 'Positionen', required: true, max: 50, addText: 'Position hinzufügen',
			copy: true, unique: [ 'label' ],
			fields: [
				{ id: 'key', type: 'text', hide: true },
				{ id: 'category', type: 'text', name: 'Kategorie', list: [ { id: 'Technik', name: 'Technik' }, { id: 'Ladung', name: 'Ladung' } ] },
				{ id: 'label', type: 'text', name: 'Bezeichnung', required: true, cols: 3 },
				{ id: 'required', type: 'bool', name: 'Pflicht', value: true },
				{ id: 'photo', type: 'bool', name: 'Foto bei Mangel' },
			],
			value: items.map( ( label, i ) => ( {
				key: `pos${ i + 1 }`, category: i === 5 || i === 6 ? 'Ladung' : 'Technik', label, required: i < 8, photo: i < 3,
			} ) ),
		},
	];
}
