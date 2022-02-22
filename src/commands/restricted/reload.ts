import { Client, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'reload',
	helpText: 'Reload various components of the bot',
	syntax: 'reload {storage | commands | schedules}',
	enabled: true,
	admin: true,
	aliases: ['load'],
	cooldown: 0,
	execute: function (
		message: Message,
		client: Client,
		args: string[] = []
	): void {
		let operation: string;
		args.length > 1 ? (operation = args[1]) : (operation = 'storage');
		switch (operation) {
			case 'storage':
				PersistantStorage.shared.load();
				console.log('[STORAGE] reloaded');
				break;
			case 'commands':
				require('../../handlers/commands')(client);
				console.log('[COMMANDS] reloaded');
				break;
			case 'schedules':
				require('../../handlers/schedules')(client);
				console.log('[SCHEDULES] reloaded');
				break;
			default:
				message.reply('Invalid operation!');
				return;
		}
		message.reply(`Reloaded ${operation}.`);
	},
};

module.exports = command;
