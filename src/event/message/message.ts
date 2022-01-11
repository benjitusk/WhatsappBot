const prefix = '!';
import WAWebJS from 'whatsapp-web.js';
import { Command } from '../../types';
import { chats } from '../../removedInfo';
import { Collection } from '@discordjs/collection';
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
		if (message.body.startsWith(prefix)) {
			// Split the message wherever there are one or more spaces.
			let args = message.body.trim().split(/ +/);
			// Remove the prefix from the first argument. and lowercase it.
			const commandName = args[0].slice(prefix.length).toLowerCase();

			// Get the command if it exists.
			let commandExists =
				client.commands.get(commandName) ||
				client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

			// If it doesn't exist, return.
			if (!commandExists) return;

			// If it does exist, check if the user has permission to use it.
			const command = commandExists as Command;

			// Check if the user has permission to use the command.
			if (command.admin) {
				let contact = await message.getContact();
				if (chats.admins.includes(contact.id._serialized)) {
					command.execute(message, client);
				} else {
					// send a private message to the user.
					let contactChat = await contact.getChat();
					contactChat.sendMessage(`You don't have permission to use this command.`);
				}
			} else {
				// Check if the user is on cooldown.
				// I'll do this later.

				// Execute the command.
				command.execute(message, client);
			}
			console.log(`[Command - ${command.name}] Executed by ${message.author || message.from}`);
		}
	},
};
