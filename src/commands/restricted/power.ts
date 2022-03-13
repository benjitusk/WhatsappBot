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
			message.reply('Bot commands are enabled.');
		} else if (args[0] == 'off') {
			Bot.shared.toggle(false);
			message.reply('Bot commands are disabled.');
		} else {
			message.reply(`${args[0]} is not a valid argument. Use !on or !off.`);
		}
	},
};

module.exports = command;
