import { Client, Message, Buttons } from 'whatsapp-web.js';
// import { chats } from '../../removedInfo';
import { Command } from '../../types';
// import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'poll',
	enabled: true,
	admin: true,
	aliases: [],
	cooldown: 0,
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		// Rewrite the entire thing here
		// Reply with emoji of construction cones and a message that the command is under construction
		message.reply('⚠️This command is under construction⚠️');
	},
};

module.exports = command;
