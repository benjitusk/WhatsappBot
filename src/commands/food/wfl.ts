import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { getMeal } from '../../utils';

const command: Command = {
	name: 'wfl',
	helpText: 'Retreive the next lunch from the WFL Database',
	syntax: 'wfl',
	aliases: ['lunch'],
	enabled: true,
	cooldown: 60,
	admin: false,
	execute: function (message: Message): void {
		let food = getMeal('lunch', new Date().setHours(13, 30));
		message.reply(food);
	},
};

module.exports = command;
