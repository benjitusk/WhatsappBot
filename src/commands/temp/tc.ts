import { Client, GroupChat, Message } from 'whatsapp-web.js';
import { Contacts } from '../../removedInfo';
import { Command } from '../../types';

const command: Command = {
	name: 'remove_tc',
	helpText: 'This command will remove everyone who switched to TC from the group.',
	syntax: 'remove_tc',
	enabled: false,
	admin: false,
	aliases: ['remove_tc'],
	cooldown: 0,
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		// Get Gavi Gershov's contact
		const chat = (await message.getChat()) as GroupChat;
		await message.reply('Removing everyone who switched to TC from the group...');
		await chat.removeParticipants([Contacts.GAVI_GERSHOV]);
		message.reply('The chat has been cleansed.');
	},
};

module.exports = command;
