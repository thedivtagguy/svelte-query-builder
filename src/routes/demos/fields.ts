import type { Field } from '$lib/types.js';

export const fields: Field[] = [
	{ name: 'firstName', label: 'First name' },
	{ name: 'lastName', label: 'Last name' },
	{ name: 'age', label: 'Age', inputType: 'number' },
	{
		name: 'isMusician',
		label: 'Is a musician',
		valueEditorType: 'checkbox',
		defaultValue: false,
	},
	{
		name: 'instrument',
		label: 'Instrument',
		valueEditorType: 'select',
		values: [
			{ name: 'Guitar', label: 'Guitar' },
			{ name: 'Piano', label: 'Piano' },
			{ name: 'Drums', label: 'Drums' },
			{ name: 'Bass', label: 'Bass' },
		],
	},
	{
		name: 'startDate',
		label: 'Start date',
		inputType: 'date',
		valueSources: ['value', 'field'],
	},
	{ name: 'endDate', label: 'End date', inputType: 'date', valueSources: ['value', 'field'] },
];

export const matchFields: Field[] = [
	...fields,
	{ name: 'phones', label: 'Phone numbers', matchModes: true },
];
