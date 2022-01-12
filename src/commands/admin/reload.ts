import { Client, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'reload',
	enabled: true,
	admin: true,
	aliases: ['load'],
	cooldown: 0,
	execute: function (message: Message, client: Client, args: string[] = []): void {
		let operation: string;
		args.length > 1 ? (operation = args[1]) : (operation = 'storage');
		switch (operation) {
			case 'storage':
				new PersistantStorage().load();
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
		}
		message.reply(`Reloaded ${operation}.`);
	},
};

module.exports = command;
