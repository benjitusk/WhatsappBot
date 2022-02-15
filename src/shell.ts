import { Client } from 'whatsapp-web.js';
import { existsSync } from 'fs';
import { Collection } from '@discordjs/collection';
const sessionPath = '../sessions/bot.json';
import repl from 'repl';
const client = new Client({
	puppeteer: {
		headless: false,
	},
	session: existsSync(sessionPath) ? require(sessionPath) : undefined,
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.filters = new Collection();

client.initialize();

['events', 'schedules', 'commands', 'filters'].forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});

const shell = repl.start('WhatsApp> ');
shell.context.client = client;
shell.on('close', () => {
	process.exit();
});
