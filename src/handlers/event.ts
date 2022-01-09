import { Client } from 'whatsapp-web.js';
import { readdirSync } from 'fs';

/**
 *
 * We are exporting a function that will be called index.js
 * This function is going to receive the client as a parameter
 * and assign the approriate event handlers to the given client.
 *
 * @param {Client} client
 * @returns {void}
 */
module.exports = (client: Client): void => {
	const eventFolders = readdirSync('./event');
	// The event handlers are sorted by types into folders, such as `message` and `opening`.
	for (const folder of eventFolders) {
		// Get all js files in the folder. These files are the event handlers.
		const eventFiles = readdirSync(`./event/${folder}`).filter((file) => file.endsWith('.js'));
		for (const file of eventFiles) {
			// Load the event handler.
			const event = require(`./event/${folder}/${file}`);
			if (event.once) {
				// Set a one time handler
				client.once(event.name, (...args) => event.execute(...args, client));
			} else {
				// Set a regular handler
				client.on(event.name, (...args) => event.execute(...args, client));
			}
		}
	}
};
