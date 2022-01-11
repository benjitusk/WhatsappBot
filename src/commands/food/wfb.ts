import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { getMeal } from '../../utils';

const command: Command = {
	name: 'wfb',
	aliases: ['breakfast'],
	enabled: true,
	cooldown: 60,
	admin: false,
	execute: function (message: Message): void {
		let food = getMeal('breakfast', new Date().setHours(9, 45));
		message.reply(food);
	},
};

module.exports = command;
