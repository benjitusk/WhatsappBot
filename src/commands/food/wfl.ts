import { Message } from 'whatsapp-web.js';
import { Command, Meal } from '../../types';
import { getNextFoodFromDateByMeal } from '../../utils';

const command: Command = {
	name: 'wfl',
	helpText: 'Retreive the next lunch from the WFL Database',
	syntax: 'wfl',
	aliases: ['wfl', 'lunch'],
	enabled: false,
	cooldown: 60,
	admin: false,
	execute: function (message: Message): void {
		let food = getNextFoodFromDateByMeal(Meal.LUNCH, new Date());
		message.reply(food);
	},
};

module.exports = command;
