import { Client, GroupChat, Message } from 'whatsapp-web.js';
import { Filter } from '../types';

let strikes: { [key: string]: { strikeTimes: number[] } } = {};
let bannedStickerIds = [
	'B5P0sP3CojjR7lEFFtbfJdFVmO9Q/zAC2ZfPkO8dLn0=',
	'+wwzrjuRiFhlbEzpcYEYXdJV51w3uCrQIjE+WtFYU8M=',
	'C2gi+WeMgHSSwy5SHYIiIg4KOQs51aRB52CUF/npbUs=',
	'MV8AZzvqHeCuR+oQdGprqUjJiT75irhQDDU/ZUy/TsE=',
	'1XgelHN4NYFonroo9JOLsLmP83HCAWN8lfRKhyy4sQk=',
];

const filter: Filter = {
	name: 'Sticker Spam',
	enabled: true,
	cooldown: 60, // seconds
	timeout: 60 * 60, // 1 hour
	tolerance: 3, // how many times to allow a user to send a spammy sticker before banning
	reason: 'was removed for spamming stickers and will be added back in',
	test: async function (message: Message): Promise<boolean> {
		if (message.type != 'sticker') return false;
		console.log(`Sticker ID: ${message.mediaKey}`);
		if (bannedStickerIds.includes(message.mediaKey!)) {
			// Add a strike to the user, creating an entry if they don't exist
			if (strikes[message.from!])
				strikes[message.from!].strikeTimes.push(new Date().getTime());
			else strikes[message.from!] = { strikeTimes: [new Date().getTime()] };

			// If strikeTimes is greater than tolerance, remove the first strike.
			// This is so we can check if the user has sent more than tolerance messages in the last cooldown period.
			if (strikes[message.from!].strikeTimes.length > this.tolerance)
				strikes[message.from!].strikeTimes.shift();

			const messageDidTriggerFilter =
				strikes[message.from] &&
				strikes[message.from].strikeTimes.length >= this.tolerance &&
				Date.now() - strikes[message.from].strikeTimes[0] <
					this.cooldown * 1000;
			// If the message did trigger the filter, reset the strikes,
			// because we are going to ban the user
			if (messageDidTriggerFilter) strikes[message.from] = { strikeTimes: [] };
			// If the message did not trigger the filter, but the user is banned,
			return messageDidTriggerFilter;
		} else return false;
		// Get the sticker ID from the message
		// If the sticker ID is in the list of epilectic stickers,
		// add a "strike" to the sender's entry in a file,
		// creating the entry if it doesn't exist.

		// ToDo: Create a command to add stickers to the banned list.
		// ToDo: Create some way to store the banned stickers and their strikes.

		// If the sender's entry has reached 3 strikes,
		// remove the sender from the chat for `timeout` seconds.
	},
};

module.exports = filter;
