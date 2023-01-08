import { Message } from 'whatsapp-web.js';
import { Command, Meal } from '../../types';
import { getNextFoodFromDateByMeal } from '../../utils';

const command: Command = {
    name: 'wfb',
    helpText: 'Retreive the next breakfast from the WFB Database',
    syntax: 'wfb',
    aliases: ['wfb', 'breakfast'],
    enabled: false,
    cooldown: 60,
    admin: false,
    execute: function (message: Message): void {
        let food = getNextFoodFromDateByMeal(Meal.BREAKFAST, new Date());
        message.reply(food);
    },
};

module.exports = command;
