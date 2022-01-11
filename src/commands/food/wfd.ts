import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';

const command: Command = {
	name: 'wfd',
	aliases: [],
	enabled: true,
	cooldown: 60,
	admin: false,
	execute: function (message: Message): void {
		message.reply('This command will be implemented in v3.5.0');
	},
};

module.exports = command;
