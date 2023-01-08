import { Client, LocalAuth } from 'whatsapp-web.js';
import { existsSync } from 'fs';
import { Collection } from '@discordjs/collection';

// Log to the console that we are starting execution
console.log('\n=== [START] ===');

const client = new Client({
	puppeteer: { headless: true },
	authStrategy: new LocalAuth({ clientId: 'bot' }),
});

client.autoResponses = new Collection();
client.commands = new Collection();
client.cooldowns = new Collection();
client.filters = new Collection();

client.initialize();

['triggers', 'events', 'commands', 'schedule'].forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});

// Log to the console on process exit
process.on('exit', () => {
	console.log('=== [STOP] ===\n');
});
