import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
	name: 'wfd',
	aliases: [],
	enabled: true,
	cooldown: 60,
	admin: false,
	execute: function (message: Message): void {
		let tomorrow = new Date().getHours() >= 19 && new Date().getMinutes() >= 30;
		let persistantStorage = new PersistantStorage();
		let storage = persistantStorage.get();

		// Check if we are in an alternate week.
		let weekNumber = storage.food.alternateWeek as number;

		// Get the day of the week as a number.
		let dayOfWeekIndex = new Date().getDay();

		// If it's past 19:30, increment the dayOfWeekIndex
		// to get the dinner for tomorrow
		if (tomorrow) dayOfWeekIndex++;

		let dayOfWeek = storage.days[dayOfWeekIndex] as string;
		// Get the food for the day.
		let dinner = storage.food.dinner[dayOfWeek];

		// check if dinner is an array.
		if (Array.isArray(dinner)) dinner = dinner[weekNumber];

		message.reply(`Dinner for to${tomorrow ? 'morrow ' : ''}night is ${dinner}`);
	},
};

module.exports = command;
