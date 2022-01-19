import { Client, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { chats } from '../../removedInfo';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'ami',
	enabled: true,
	admin: false,
	aliases: [],
	cooldown: 0,
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		// If we are in a group chat, ignore
		if ((await message.getChat()).isGroup) return;

		// Contact of sender
		const contact = await message.getContact();

		// Make sure they are authorized to use this command
		if (!chats.quoteSubmitters.includes(contact.id._serialized)) {
			message.reply('You are not authorized to use this command!');
			return;
		}

		// remove the first argument, which is the command name
		args.shift();

		// get the quote
		const quote = args.join(' ').trim();

		// Make sure the quote is not empty
		if (quote.length === 0) {
			message.reply('You must submit a quote!');
			return;
		}

		// Save the quote to persistent storage
		const persistance = new PersistantStorage();
		let storage = persistance.get();
		storage.amiQuotes.push({
			submitter: contact.id._serialized,
			quote: quote,
		});
		persistance.set(storage);
		// Reply to the user
		message.reply(`Quote submitted! There are now ${storage.amiQuotes.length} quotes saved.`);
	},
};

module.exports = command;
