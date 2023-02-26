import { LocalAuth, Client } from 'whatsapp-web.js';
const commandLineArgs = require('command-line-args');

// Hard limit of 45 seconds
setTimeout(() => {
    console.error('Timed out');
    process.exit(1);
}, 45000).unref();

const optionDefinitions = [
    { name: 'contact', type: String },
    { name: 'message', type: String },
];
const options = commandLineArgs(optionDefinitions);

const client = new Client({
    puppeteer: { headless: true },
    authStrategy: new LocalAuth({
        clientId: 'benji',
    }),
});

['events'].forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

client.once('ready', async () => {
    await client.sendMessage(options.contact, options.message);
    console.log('Message sent!');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await client.destroy();
    process.exit();
});
// });

client.initialize();
