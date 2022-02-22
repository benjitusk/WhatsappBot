import prettyMilliseconds from 'pretty-ms';
import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'daysToPurim',
	helpText: 'Get the time remaining until Purim',
	syntax: 'dtp',
	enabled: true,
	aliases: ['dtp'],
	admin: false,
	cooldown: 0,
	execute(message: Message): void {
		const persistantStorage = PersistantStorage.shared;
		const timeToPurim: number =
			persistantStorage.getCountdowns().purim - Date.now();
		const prettyTimeToPurim: string = prettyMilliseconds(timeToPurim, {
			secondsDecimalDigits: 0,
			verbose: true,
		});
		if (timeToPurim > 0)
			message.reply(`*${prettyTimeToPurim} until Purim!*\n🥂 Lchaim!`);
		else if (timeToPurim <= 0 && timeToPurim > -86400000)
			message.reply(`It's Purim!\n🥂⬇️ L- *hiccup* - Lchaim! - *hiccup*`);
		// else message.reply(`${timeToPurim + 355} days until Purim!\n🥂 Lchaim!`);
	},
};

module.exports = command;
