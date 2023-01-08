import { Client, Message } from 'whatsapp-web.js';
import { BotState, Command } from '../../types';
import { Bot } from '../../utils';

const command: Command = {
    name: 'power',
    helpText: 'Enable/Disable the bot',
    syntax: '!on | !off | !shutdown',
    enabled: true,
    admin: true,
    aliases: ['power', 'on', 'off', 'shutdown'],
    cooldown: 0,
    execute: function (message: Message, client: Client, args: string[]): void {
        switch (args[0]) {
            case 'on':
                Bot.shared.setState(BotState.ON);
                message.reply('Bot commands are enabled.');
                break;
            case 'off':
                Bot.shared.setState(BotState.ADMIN_ONLY);
                message.reply('Only admin enabled commands work.');
                break;
            case 'shutdown':
                Bot.shared.setState(BotState.OFF);
                message.reply(
                    'Bot will no longer respond to commands until manually restarted.'
                );
            default:
                message.reply(`${args[0]} is not a valid argument.`);
                break;
        }
    },
};

module.exports = command;
