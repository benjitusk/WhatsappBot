import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'wfl',
	aliases: ['lunch'],
	enabled: true,
	cooldown: 60,
	admin: false,
	execute: function (message: Message): void {
		// If it's past 13:30, make the appropriate changes.
		let tomorrow = new Date().setHours(13, 30) < new Date().getTime();
		let persistantStorage = new PersistantStorage();
		let storage = persistantStorage.get();

		// Check if we are in an alternate week.
		let weekNumber = storage.food.alternateWeek as number;

		// Get the day of the week as a number.
		let dayOfWeekIndex = new Date().getDay();

		if (tomorrow) dayOfWeekIndex++;

		let dayOfWeek = storage.days[dayOfWeekIndex] as string;
		// Get the food for the day.
		let lunch = storage.food.lunch[dayOfWeek];

		// check if lunch is an array.
		if (Array.isArray(lunch)) lunch = lunch[weekNumber];

		message.reply(`lunch ${tomorrow ? 'tomorrow' : 'today'} is ${lunch}`);
	},
};

module.exports = command;
