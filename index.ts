import { Client } from 'whatsapp-web.js';

const client = new Client({
  /*     puppeteer: {
        headless: false,
    }, */
  session: require('./sessions/bot.json'),
});

client.initialize();

['events', 'commands'].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});
