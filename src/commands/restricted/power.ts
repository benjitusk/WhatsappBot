import { Client, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { Bot } from '../../utils';

const command: Command = {
	name: 'power',
	helpText: 'Enable/Disable the bot',
	syntax: '!on | !off',
	enabled: true,
	admin: true,
	aliases: ['on', 'off'],
	cooldown: 0,
	execute: function (message: Message, client: Client, args: string[]): void {
		if (args[0] == 'on') {
			Bot.shared.toggle(true);
			message.reply('Bot enabled');
		} else if (args[0] == 'off') {
			Bot.shared.toggle(false);
			message.reply('Bot disabled');
		}
	},
};

module.exports = command;
