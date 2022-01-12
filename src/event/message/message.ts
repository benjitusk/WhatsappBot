const prefix = '!';
import WAWebJS from 'whatsapp-web.js';
import { Command } from '../../types';
import { chats } from '../../removedInfo';
import prettyMilliseconds from 'pretty-ms';
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
			let contact = await message.getContact();

			if (command.admin) {
				if (!chats.admins.includes(contact.id._serialized)) {
					// send a private message to the user.
					let contactChat = await contact.getChat();
					message.reply(
						`You don't have permission to use this command.`,
						contactChat.id._serialized
					);
					return;
				}
			} else {
				// Check if a cooldown is in effect.
				if (client.cooldowns.has(command.name)) {
					const now = Date.now();
					// Get the cooldown.
					const commandCooldown = client.cooldowns.get(command.name);

					// Check if there is an active cooldown.
					if (commandCooldown && commandCooldown > now) {
						// Get the time remaining.
						const timeRemaining = commandCooldown - now;
						const prettyTime = prettyMilliseconds(timeRemaining, { secondsDecimalDigits: 0 });
						// Send a message to the user.
						message.reply(`You need to wait ${prettyTime} before using this command again.`);
						return;
					}
					// Set a cooldown for the command, as we are about to execute it.
				} else client.cooldowns.set(command.name, Date.now() + command.cooldown * 1000);
				// Cooldown check: 		PASSED.
				// Permission check: 	PASSED.
				// Execute the command
				command.execute(message, client, args);
				console.log(
					`[Command] ${contact.name || contact.pushname || contact.number} executed${
						command.admin ? ' [ADMIN] ' : ' '
					}command: ${command.name}`
				);
			}
		}
	},
};
