import prettyMilliseconds from 'pretty-ms';
import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'daystopesach',
	helpText: 'Get the time remaining until Pesach',
	syntax: 'dtpesach',
	enabled: false,
	aliases: ['dtp', 'daystopesach', 'dtpesach', 'dtpassover'],
	admin: false,
	cooldown: 0,
	execute(message: Message): void {
		const persistantStorage = PersistantStorage.shared;
		const timeToPesach: number = persistantStorage.getCountdowns().pesach - Date.now();
		const prettyTimeToPurim: string = prettyMilliseconds(timeToPesach, {
			secondsDecimalDigits: 0,
			verbose: true,
		});
		if (timeToPesach > 0)
			message.reply(`*${prettyTimeToPurim} until Pesach!*\n🍷🍷🍷🍷 Chag Sameach!`);
		else if (timeToPesach <= 0 && timeToPesach > -86400000)
			message.reply(`It's Pesach!\n(There's no empty cup emojis...)⬇️ Chag Sameach!`);
		// else message.reply(`${timeToPurim + 355} days until Purim!\n🥂 Lchaim!`);
	},
};

module.exports = command;
