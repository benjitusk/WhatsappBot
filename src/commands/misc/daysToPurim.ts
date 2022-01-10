import { Message, Client } from 'whatsapp-web.js';
import { Command, PersistantStorage } from '../../utils';

const command: Command = {
	name: 'daysToPurim',
	aliases: ['dtp'],
	enabled: true,
	cooldown: 0,
	execute(message: Message, client: Client): void {
		const persistantStorage = new PersistantStorage();
		const daysToPurim: number = persistantStorage.get('daysToPurim');
		if (daysToPurim > 0) message.reply(`*${daysToPurim} days until Purim!*\n🥂 Lchaim!`);
		else if (daysToPurim === 0) message.reply(`It's Purim!\n🥂⬇️ L- *hiccup* - Lchaim! - *hiccup*`);
		else if (daysToPurim < 0) message.reply(`${daysToPurim + 355} days until Purim!\n🥂 Lchaim!`);
	},
};

module.exports = command;
