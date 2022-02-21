import { Message, Client } from 'whatsapp-web.js';
import { Command } from '../../types';

const command: Command = {
	name: 'forwardCount',
	helpText: 'Retrieve the number of times this message was forwarded.',
	syntax: 'forwardCount',
	enabled: true,
	admin: false,
	aliases: ['forwardScore'],
	cooldown: 0,
	execute: async function (
		message: Message,
		client: Client,
		args: string[]
	): Promise<void> {
		const quotedMessage = await message.getQuotedMessage();
		if (!quotedMessage)
			message.reply(
				'You can quote a message to get the number of times it was forwarded.'
			);
		else {
			quotedMessage.reply(
				`This message was forwarded ${quotedMessage.forwardingScore} ${
					quotedMessage.forwardingScore === 1 ? 'time' : 'times'
				}.`
			);
		}
	},
};

module.exports = command;
