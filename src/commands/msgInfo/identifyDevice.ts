import { Message, Client } from 'whatsapp-web.js';
import { Command } from '../../types';

const command: Command = {
	name: 'device',
	helpText: 'Identify the device that the quoted message was sent from',
	syntax: 'device',
	enabled: true,
	admin: false,
	aliases: [],
	cooldown: 0,
	execute: async function (
		message: Message,
		client: Client,
		args: string[]
	): Promise<void> {
		const quotedMessage = await message.getQuotedMessage();
		if (!quotedMessage)
			message.reply(
				'Your message was sent using WhatsApp for ' +
					message.deviceType +
					'.\nYou can quote a message to get the device that message was sent from.'
			);
		else {
			quotedMessage.reply(
				'This message was sent using WhatsApp for ' +
					quotedMessage.deviceType +
					'.'
			);
		}
	},
};

module.exports = command;
