import { Client } from 'whatsapp-web.js';
import { readdirSync } from 'fs';
import { Filter } from '../types';

module.exports = (client: Client): void => {
	// Get all js files in the folder. These files are the filter controls.
	const filterFiles = readdirSync(`./filters`).filter((file) =>
		file.endsWith('.js')
	);
	for (const file of filterFiles) {
		// Load the filter control.
		const filter: Filter = require(`../filters/${file}`);
		if (filter.__esModule)
			throw new Error(`filters/${file} is missing module.exports`);
		if (filter.enabled) {
			client.filters.set(filter.name.toLowerCase(), filter);
			console.log(`[Filter] enabled ${filter.name}`);
		} else console.log(`[Filter] DISABLED ${filter.name}`);
	}
};
