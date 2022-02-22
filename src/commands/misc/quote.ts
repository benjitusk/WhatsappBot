import axios from 'axios';
import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'quote',
	helpText: 'Get a random quote',
	syntax: 'quote',
	enabled: true,
	admin: false,
	aliases: [],
	cooldown: 0,
	execute: async function (message: Message): Promise<void> {
		const persistance = PersistantStorage.shared;
		const quote = persistance.getTopQuote();
		if (quote !== undefined) {
			message.reply(`"${quote.content}"\n- ${quote.author}`);
			persistance.removeQuoteByID(quote.id);
		} else {
			let response = await axios.get(
				'https://api.quotable.io/random?tags=friendship|happiness|wisdom'
			);
			let quote = response.data as { content: string; author: string };
			// remove the first and last characters IF they are a quote mark
			if (
				quote.content.charAt(0) === '"' &&
				quote.content.charAt(quote.content.length - 1) === '"'
			)
				quote.content = quote.content.substring(1, quote.content.length - 1);
			message.reply(`"${quote.content}"\n- ${quote.author}`);
		}
	},
};

module.exports = command;
