import { Client } from 'whatsapp-web.js';
import { existsSync } from 'fs';
import { Collection } from '@discordjs/collection';
const sessionPath = '../sessions/bot.json';
const client = new Client({
	// puppeteer: {
	// 	headless: true,
	// },
	session: existsSync(sessionPath) ? require(sessionPath) : undefined,
});

client.commands = new Collection();

client.initialize();

['events', 'schedules', 'commands'].forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});
