import { Client, ClientSession } from 'whatsapp-web.js';
import { writeFile } from 'fs';
module.exports = {
	name: 'authenticated',
	once: false,
	async execute(session: ClientSession, client: Client) {
		let sessionString = JSON.stringify(session);
		writeFile('../sessions/bot.js', sessionString, (err) => {
			if (err) console.error(err);
		});
		console.log('[Client] Authenticated');
	},
};
