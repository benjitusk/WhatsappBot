import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { getMeal } from '../../utils';

const command: Command = {
	name: 'wfd',
	aliases: ['dinner'],
	enabled: true,
	cooldown: 60,
	admin: false,
	execute: function (message: Message): void {
		let food = getMeal(new Date().setHours(19, 30), 'breakfast');
		message.reply(food);
	},
};

module.exports = command;
