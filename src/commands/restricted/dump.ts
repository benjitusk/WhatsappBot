import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'dump',
	enabled: true,
	admin: true,
	aliases: [],
	cooldown: 0,
	execute: function (message: Message): void {
		const storage = new PersistantStorage().get();
		message.reply(JSON.stringify(storage, null, 2));
	},
};

module.exports = command;
