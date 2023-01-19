import { Message } from 'whatsapp-web.js';
import { Command, CustomClient } from '../../types';
import { Bot } from '../../utils';

const command: Command = {
    name: 'toggle',
    helpText: 'Enable/Disable features by name',
    syntax: '!toggle',
    enabled: true,
    admin: true,
    aliases: ['toggle'],
    cooldown: 0,
    execute: function (
        message: Message,
        client: CustomClient,
        args: string[]
    ): void {
        // This command can be used to enable/disable features by name
        // This is useful for testing new features without having to restart the bot
        // This command is restricted to admins only
        let featureToToggle = args[1];
        let toggleState = args[2];
        if (featureToToggle === 'toggle') {
            message.reply("You can't toggle the toggle command!");
            return;
        }
        if (toggleState === 'on') {
            Bot.shared.setFeatureState(featureToToggle, true, client);
            message.reply(`Feature ${featureToToggle} has been enabled`);
        } else if (toggleState === 'off') {
            Bot.shared.setFeatureState(featureToToggle, false, client);
            message.reply(`Feature ${featureToToggle} has been disabled`);
        } else {
            message.reply(
                'Invalid syntax. Please use !toggle <feature> <on/off>'
            );
        }
    },
};

module.exports = command;
