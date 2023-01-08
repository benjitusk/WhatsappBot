import { Message } from 'whatsapp-web.js';
import { Command, Meal } from '../../types';
import { getNextFoodFromDateByMeal } from '../../utils';

const command: Command = {
    name: 'wfd',
    helpText: 'Retreive the next dinner from the WFD Database',
    syntax: 'wfd',
    aliases: ['wfd', 'dinner'],
    enabled: false,
    cooldown: 60,
    admin: false,
    execute: function (message: Message): void {
        let food = getNextFoodFromDateByMeal(Meal.DINNER, new Date());
        message.reply(food);
    },
};

module.exports = command;
