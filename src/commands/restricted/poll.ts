import { Client, Message, Buttons } from 'whatsapp-web.js';
// import { chats } from '../../removedInfo';
import { Command } from '../../types';
// import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'poll',
	helpText: 'Create a poll',
	syntax: 'poll <question>',
	enabled: true,
	admin: true,
	aliases: ['poll'],
	cooldown: 0,
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		/*/ Remove the command from the args
		const options = message.body.split('!poll\n')[1];
		// Arguments will be in the format of:
		// title: <string>
		// body: <string>
		// button1: <string>
		// button2: <string>
		// [button3: <string>]

		// split the args by newlines
		const argsArray = options.split('\n');
		// Create a dictionary of the args
		const argsDict = argsArray.reduce((acc, curr) => {
			const [key, value] = curr.split(': ');
			acc[key] = value;
			return acc;
		}, {});
		*/
		message.reply('⚠️This command is under construction⚠️');
	},
};

module.exports = command;
