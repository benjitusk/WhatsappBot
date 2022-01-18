import { Message, Client } from 'whatsapp-web.js';
import { chats } from '../../removedInfo';
import { Command } from '../../types';

const command: Command = {
	name: 'weisswisdom',
	enabled: true,
	admin: false,
	aliases: ['amiadvice'],
	cooldown: 45,
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		// Get the last 100 messages from the chat
		const chat = await client.getChatById(chats.WHATS_FOR_DINNER_ID);
		const last1kMessages = await chat.fetchMessages({ limit: 1000 });
		// remove all messages which are not from the bot
		let messagesFromAmi = last1kMessages.filter((msg) => msg.author == chats.AMI_WEISS);
		// remove all messages which are less than 10 characters long
		messagesFromAmi =
			messagesFromAmi.filter((msg) => msg.body.length > 10) || message.type === 'ptt';
		// get a random message from the list
		const randomMessage = messagesFromAmi[Math.floor(Math.random() * messagesFromAmi.length)];
		randomMessage.reply('^_^');
	},
};

module.exports = command;
