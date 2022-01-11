const prefix = '!';
import WAWebJS from 'whatsapp-web.js';
import { Command } from '../../types';
module.exports = {
	name: 'message',
	once: false,
	/**
	 *
	 * @param {WAWebJS.Message} message The message object triggering the event.
	 * @param {WAWebJS.Client} client   The client object that received the message.
	 *
	 * @returns { Promise<void> }
	 */
	async execute(message: WAWebJS.Message, client: WAWebJS.Client): Promise<void> {
		/**
		 * Any functionality that needs to be executed
		 * when a message is received can be done here.
		 *
		 * Here are the processes that will be executed:
		 *
		 * 1. Log the message to MySQL.
		 * 2. Handle commands.
		 * 3. Handle poll responses.
		 *
		 */

		// 1. Log the message to MySQL.
		// I'll do this later.

		// 2. Handle commands.
		if (!message.body.startsWith(prefix)) return;
		let args = message.body.trim().split(/ +/);
		const commandName = args[0].slice(prefix.length).toLowerCase();
		let commandExists =
			client.commands.get(commandName) ||
			client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
		if (!commandExists || commandExists === '') {
			// message.reply('Looks the commands is invalid.');
			return;
		}
		const command = commandExists as Command;
		command.execute(message, client);
	},
};
