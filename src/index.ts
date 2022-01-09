import { Client } from 'whatsapp-web.js';
import { existsSync } from 'fs';
const sessionPath = '../sessions/bot.json';
const client = new Client({
	puppeteer: {
		headless: false,
	},
	session: existsSync(sessionPath) ? require(sessionPath) : undefined,
});

client.initialize();

['event'].forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});
