import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'reload',
	enabled: true,
	admin: true,
	aliases: ['load'],
	cooldown: 0,
	execute: function (message: Message): void {
		new PersistantStorage().load();
		message.reply('Reloaded!');
	},
};

module.exports = command;
