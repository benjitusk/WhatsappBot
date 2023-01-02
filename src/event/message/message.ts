const prefix = '!';
import WAWebJS, { GroupChat } from 'whatsapp-web.js';
import { AutoResponse, BotState, Command, Filter, TaskActions } from '../../types';
import { Contacts } from '../../removedInfo';
import prettyMilliseconds from 'pretty-ms';
import { Bot, Users } from '../../utils';
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
		 * 1. Check message against content filters.
		 * 2. Handle commands.
		 * 3. Handle auto responses.
		 * 4. Handle poll responses.
		 *
		 */

		// 1. Check message against content filters if it's a group chat.

		client.filters.forEach(async (filter: Filter) => {
			if (await filter.test(message)) {
				// Remove the sender from the group.
				const contact = await message.getContact();
				const chat = (await message.getChat()) as GroupChat;
				if (chat.isGroup) {
					const name = contact.name || contact.pushname || contact.number;
					console.log(
						`${name} was removed for ${filter.reason}, and will be unbanned in ${
							filter.timeout / (60 * 60)
						} ${filter.timeout === 1 ? 'hour' : 'hours'}.`
					);

					Users.shared.banUserFromChat(contact, chat, filter.timeout * 1000, filter.reason);
				}
			}
		});

		// 2. Handle commands.
		if (message.body.startsWith(prefix)) {
			// Split the message wherever there are one or more spaces or newlines.
			let args = message.body.trim().split(/[ \n]+/);
			args[0] = args[0].slice(prefix.length);
			// Remove the prefix from the first argument. and lowercase it.
			const commandName = args[0].toLowerCase();

			// Get the command if it exists.
			let commandExists = client.commands.find(
				(cmd: Command) => cmd.aliases && cmd.aliases.includes(commandName)
			);

			// If it doesn't exist, return.
			if (!commandExists) return;

			// Check if the user has permission to use the command.
			let contact = await message.getContact();

			// Make sure the command is enabled.
			if (!commandExists.enabled) {
				console.log(
					`[Command] ${
						contact.name || contact.pushname || contact.number
					} tried to use command ${commandName} but it is disabled.`
				);
				return;
			}

			// If it does exist, check if the user has permission to use it.
			const command = commandExists as Command;

			let shouldExecute = true;
			switch (Bot.shared.getState()) {
				case BotState.OFF:
					return;
				case BotState.ADMIN_ONLY:
					if (!command.admin) return;
					break;
				case BotState.ON:
					break;
			}

			if (command.admin) {
				if (!Contacts.admins.includes(contact.id._serialized)) {
					// send a private message to the user.
					let contactChat = await contact.getChat();
					message.reply(
						`You don't have permission to use this command.`,
						contactChat.id._serialized
					);
					shouldExecute = false;
				}
			} else {
				// Check if bot is enabled
				if (
					!Contacts.admins.includes(contact.id._serialized) &&
					client.cooldowns.has(command.name)
				) {
					// Check if a cooldown is in effect.
					const now = Date.now();
					// Get the cooldown.
					const commandCooldown = client.cooldowns.get(command.name);

					// Check if there is an active cooldown.
					if (commandCooldown && commandCooldown > now) {
						// Get the time remaining.
						const timeRemaining = commandCooldown - now;
						const prettyTime = prettyMilliseconds(timeRemaining, {
							secondsDecimalDigits: 0,
						});
						// Send a message to the user.
						message.reply(`You need to wait ${prettyTime} before using this command again.`);
						shouldExecute = false;
					} else client.cooldowns.set(command.name, Date.now() + command.cooldown * 1000);
					// Set a cooldown for the command, as we are about to execute it.
				} else client.cooldowns.set(command.name, Date.now() + command.cooldown * 1000);
			}
			if (!shouldExecute) return;
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

		// 3. Handle auto responses.
		client.autoResponses.forEach(async (autoResponse: AutoResponse) => {
			if (autoResponse.enabled) {
				if (await autoResponse.executeCondition(message)) {
					autoResponse.execute(message, client);
					console.log(`[AutoResponse] ${autoResponse.name} was executed.`);
				}
			} else {
				console.log(`[AutoResponse] ${autoResponse.name} is disabled.`);
			}
		});

		// 3. Handle poll responses.
		// if (message.type === 'buttons_response') {
		// 	const persistance = new PersistantStorage();
		// 	const storage = persistance.get();
		// 	const pollID = message.selectedButtonId!;
		// 	const vote = pollID.split('_')[1];
		// 	const contact = await message.getContact();
		// 	const contactChat = await contact.getChat();

		// 	let poll = storage.polls[pollID];

		// 	// If the poll is expired, delete it and notify the user.
		// 	if (!poll || poll.expiration < Date.now()) {
		// 		delete storage.polls[pollID];
		// 		persistance.set(storage);
		// 		message.reply('This poll has expired.', contactChat.id._serialized);
		// 		return;
		// 	}

		// 	// If the poll is not expired, check if the user has already voted.
		// 	if (poll.voters.includes(message.author!)) {
		// 		// Privately reply to the user.
		// 		message.reply(
		// 			`You don't have permission to use this command.`,
		// 			contactChat.id._serialized
		// 		);
		// 		return;
		// 	}

		// 	// If the user has not voted, add them to the list of voters.
		// 	poll.voters.push(message.author!);
		// 	// Add the vote to the poll.
		// 	poll.votes[vote]++;
		// 	// Save the poll.
		// 	persistance.set(storage);
		// }
	},
};
