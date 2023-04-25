import { LocalAuth } from 'whatsapp-web.js';
import repl from 'repl';
import { CustomClient } from './types';
const client = new CustomClient({
    authStrategy: new LocalAuth({ clientId: 'bot' }),
    puppeteer: {
        headless: true,
    },
});

client.initialize();

['events', 'commands'].forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

const shell = repl.start('WhatsApp> ');
shell.context.client = client;
shell.on('close', () => {
    process.exit();
});
