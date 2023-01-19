import { LocalAuth } from 'whatsapp-web.js';
import { Collection } from '@discordjs/collection';
import { CustomClient } from './types';

// Log to the console that we are starting execution
console.log('\n=== [START] ===');

const client = new CustomClient({
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
