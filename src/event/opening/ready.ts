import { Client } from 'whatsapp-web.js';

module.exports = {
	name: 'ready',
	once: false,
	async execute(client: Client) {
		console.log('[Client] Ready');
	},
};
