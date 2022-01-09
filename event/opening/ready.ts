import { Client } from 'whatsapp-web.js';

module.exports = {
	name: 'ready',
	once: true,
	async execute(client: Client) {
		console.log('[Client] Ready');
	},
};
