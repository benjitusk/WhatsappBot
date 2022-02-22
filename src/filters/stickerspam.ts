import { Message } from 'whatsapp-web.js';
import { Filter } from '../types';
import { md5, PersistantStorage } from '../utils';

let strikes: { [key: string]: { strikeTimes: number[] } } = {};

const filter: Filter = {
	name: 'Sticker Spam',
	enabled: true,
	cooldown: 60, // Density of strikes before being removed.
	timeout: 60 * 60, // 1 hour
	tolerance: 7, // how many times to allow a user to send a sticker within `cooldown` before banning
	reason: 'spamming stickers',
	test: async function (message: Message): Promise<boolean> {
		if (message.type != 'sticker') return false;
		// Add a strike to the user, creating an entry if they don't exist
		if (strikes[message.from!])
			strikes[message.from!].strikeTimes.push(Date.now());
		else strikes[message.from!] = { strikeTimes: [Date.now()] };

		// If strikeTimes is greater than tolerance, remove the first strike.
		// This is so we can check if the user has sent more than tolerance messages in the last cooldown period.
		if (strikes[message.from!].strikeTimes.length > this.tolerance)
			strikes[message.from!].strikeTimes.shift();

		const messageDidTriggerFilter =
			strikes[message.from] &&
			strikes[message.from].strikeTimes.length >= this.tolerance &&
			Date.now() - strikes[message.from].strikeTimes[0] < this.cooldown * 1000;
		// If the message did trigger the filter, reset the strikes,
		// because we are going to ban the user
		if (messageDidTriggerFilter) strikes[message.from] = { strikeTimes: [] };
		return messageDidTriggerFilter;
	},
};

module.exports = filter;
