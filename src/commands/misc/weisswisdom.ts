import { Message, Client } from 'whatsapp-web.js';
import { Command } from '../../types';

const command: Command = {
    name: 'weisswisdom',
    helpText: 'Get a random quote from the Ami Weiss Wisdom Database (TM)',
    syntax: 'weisswisdom',
    enabled: false,
    admin: false,
    aliases: ['weisswisdom', 'amiadvice', 'amiquote'],
    cooldown: 0,
    execute: async function (
        message: Message,
        client: Client,
        args: string[]
    ): Promise<void> {
        message.reply(
            `You need to wait ∞ minutes and ${new Date().getSeconds()} seconds before using this command again`
        );
    },
};

module.exports = command;
