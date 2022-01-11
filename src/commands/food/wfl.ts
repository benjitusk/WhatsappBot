import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { getMeal } from '../../utils';

const command: Command = {
	name: 'wfl',
	aliases: ['lunch'],
	enabled: true,
	cooldown: 60,
	admin: false,
	execute: function (message: Message): void {
		let food = getMeal(new Date().setHours(13, 30), 'breakfast');
		message.reply(food);
	},
};

module.exports = command;
