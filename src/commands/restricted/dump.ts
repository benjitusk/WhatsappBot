import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { Bot, PersistantStorage } from '../../utils';

const command: Command = {
	name: 'dump',
	helpText: 'Dump the persistant data',
	syntax: 'dump',
	enabled: true,
	admin: true,
	aliases: ['dump'],
	cooldown: 0,
	execute: function (message: Message): void {
		const storage = PersistantStorage.shared.dump();
		message.reply(JSON.stringify(storage, null, 2));
		message.reply(JSON.stringify(Bot.shared.data, null, 2));
	},
};

module.exports = command;
