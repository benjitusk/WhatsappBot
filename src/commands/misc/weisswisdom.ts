import { Message, Client } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'weisswisdom',
	helpText: 'Get a random quote from the Ami Weiss Wisdom Database (TM)',
	syntax: 'weisswisdom',
	enabled: false,
	admin: false,
	aliases: ['amiadvice', 'amiquote'],
	cooldown: 60 * 60 * 6, // 6 hour cooldown
	execute: async function (
		message: Message,
		client: Client,
		args: string[]
	): Promise<void> {
		// load persistent storage
		const persistance = new PersistantStorage();
		const storage = persistance.get();
		// get a random quote
		const quote =
			storage.amiQuotes[Math.floor(Math.random() * storage.amiQuotes.length)]
				.quote;
		message.reply(`^_^\n\n${quote}`);
	},
};

module.exports = command;
