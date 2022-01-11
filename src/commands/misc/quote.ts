import axios from 'axios';
import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'quote',
	enabled: true,
	admin: false,
	aliases: [],
	cooldown: 0,
	execute: async function (message: Message): Promise<void> {
		const persistance = new PersistantStorage();
		let storage = persistance.get();
		if (storage.quotes.length > 0) {
			let quote = storage.quotes.shift() as { content: string; author: string };
			message.reply(`"${quote.content}"\n- ${quote.author}`);
			persistance.set(storage);
		} else {
			let response = await axios.get(
				'https://api.quotable.io/random?tags=friendship|happiness|wisdom'
			);
			let quote = response.data as { content: string; author: string };
			message.reply(`"${quote.content}"\n- ${quote.author}`);
		}
	},
};

module.exports = command;
