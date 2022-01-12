import { Client, Message, Buttons } from 'whatsapp-web.js';
import { chats } from '../../removedInfo';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'poll',
	enabled: true,
	admin: true,
	aliases: [],
	cooldown: 0,
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		const persistance = new PersistantStorage();
		let storage = persistance.get();
		/**
		 * Parse the arguments
		 * the are in the following of:
		 * poll
		 * mealName: <string>
		 * foodName: <string>
		 * [test: <boolean>]
		 * [allowMeh: <boolean>]
		 */

		// create a dictionary of the arguments
		const argsDict: { [key: string]: string } = {};
		// Ignore the first argument, which is the command name
		for (let i = 1; i < args.length; i += 2) {
			const key = args[i].replace(':', '');
			const value = args[i + 1];
			argsDict[key] = value;
		}
		// Check if the arguments are valid
		if (!argsDict.mealName || !argsDict.foodName) {
			message.reply(
				'Invalid arguments. Please use the format:\n```!poll\nmealName: <string>\nfoodName: <string>\n[test: <boolean>]\n[allowMeh: <boolean>]```'
			);
			return;
		}

		let pollID = `${argsDict.foodName.replaceAll(' ', '_')}_${new Date().getMonth() + 1}/${
			new Date().getDate() + 1
		}`;

		const chat = argsDict.test
			? await message.getChat()
			: await client.getChatById((chats[argsDict.chat] as string) || chats.BOT_MAIN_CHAT);
		// Prepare the buttons
		const buttonArray = [
			{ id: pollID + '_good', body: '👍' },
			{ id: pollID + '_meh', body: '🤷' },
			{ id: pollID + '_bad', body: '👎' },
		];
		// remove the meh button if the option is not allowed
		if (!argsDict.allowMeh) buttonArray.splice(1, 1);
		// Set up title, body, and footer
		const title = `${argsDict.mealName.charAt(0).toUpperCase() + argsDict.mealName.slice(1)} poll`;
		const body = `Please vote on the ${argsDict.foodName} served at ${argsDict.mealName}.`;
		const footer = `Once you cast your vote, subsequent votes by you will be ignored.`;
		const buttons = new Buttons(body, buttonArray as any, title, footer);

		// Send the poll
		chat.sendMessage(buttons);

		// Save the poll
		const poll = {
			expiration: new Date().getTime() + 1000 * 60 * 60 * 3, // 3 hours
			votes: {
				good: 0,
				meh: 0,
				bad: 0,
			},
			voters: [],
		};
		storage.polls[pollID] = poll;
	},
};

module.exports = command;
