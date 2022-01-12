import { Client } from 'whatsapp-web.js';
import { existsSync } from 'fs';
import { Collection } from '@discordjs/collection';

// Log to the console that we are starting execution
console.log('\n=== [START] ===');

const sessionPath = '../sessions/bot.json';
const client = new Client({
	// puppeteer: {
	// 	headless: true,
	// },
	session: existsSync(sessionPath) ? require(sessionPath) : undefined,
});

client.commands = new Collection();
client.cooldowns = new Collection();

client.initialize();

['events', 'schedules', 'commands'].forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});

// Log to the console on process exit
process.on('exit', () => {
	console.log('=== [STOP] ===\n');
});
