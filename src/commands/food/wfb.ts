import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'wfb',
	aliases: ['breakfast'],
	enabled: true,
	cooldown: 60,
	admin: false,
	execute: function (message: Message): void {
		// If it's past 9:45, make the appropriate changes.
		let tomorrow = new Date().setHours(9, 45) < new Date().getTime();
		let persistantStorage = new PersistantStorage();
		let storage = persistantStorage.get();

		// Check if we are in an alternate week.
		let weekNumber = storage.food.alternateWeek as number;

		// Get the day of the week as a number.
		let dayOfWeekIndex = new Date().getDay();

		if (tomorrow) dayOfWeekIndex++;

		let dayOfWeek = storage.days[dayOfWeekIndex] as string;
		// Get the food for the day.
		let breakfast = storage.food.breakfast[dayOfWeek];

		// check if breakfast is an array.
		if (Array.isArray(breakfast)) breakfast = breakfast[weekNumber];

		message.reply(`Breakfast for ${tomorrow ? 'tomorrow' : 'today'} is ${breakfast}`);
	},
};

module.exports = command;
