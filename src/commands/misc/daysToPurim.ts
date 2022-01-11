import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'daysToPurim',
	enabled: true,
	aliases: ['dtp'],
	admin: false,
	cooldown: 0,
	execute(message: Message): void {
		const persistantStorage = new PersistantStorage();
		const daysToPurim: number = persistantStorage.get('daysToPurim');
		if (daysToPurim > 0) message.reply(`*${daysToPurim} days until Purim!*\n🥂 Lchaim!`);
		else if (daysToPurim === 0) message.reply(`It's Purim!\n🥂⬇️ L- *hiccup* - Lchaim! - *hiccup*`);
		else if (daysToPurim < 0) message.reply(`${daysToPurim + 355} days until Purim!\n🥂 Lchaim!`);
	},
};

module.exports = command;
