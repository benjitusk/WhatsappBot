import { Client } from 'whatsapp-web.js';

module.exports = {
	name: 'auth_failure',
	once: false,
	async execute(error: any, client: Client) {
		console.log('[Client] Authentication failed');
		console.log(error);
	},
};
