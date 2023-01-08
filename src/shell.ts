import { Client, LocalAuth } from 'whatsapp-web.js';
import { existsSync } from 'fs';
import { Collection } from '@discordjs/collection';
import repl from 'repl';
const sessionPath = '../sessions/bot.json';
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot' }),
    puppeteer: {
        headless: false,
    },
});
client.commands = new Collection();
client.cooldowns = new Collection();
client.filters = new Collection();

client.initialize();

['events'].forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

const shell = repl.start('WhatsApp> ');
shell.context.client = client;
shell.on('close', () => {
    process.exit();
});
