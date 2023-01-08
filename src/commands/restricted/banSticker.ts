import { Client, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { md5, PersistantStorage } from '../../utils';

const command: Command = {
    name: 'bansticker',
    helpText: 'adds a sticker to the banned list',
    syntax: 'bansticker [unban]',
    enabled: true,
    admin: true,
    aliases: ['bansticker'],
    cooldown: 0,
    execute: async function (
        message: Message,
        client: Client,
        args: string[]
    ): Promise<void> {
        const quotedMessage = await message.getQuotedMessage();
        if (!quotedMessage) return;
        const sticker = await quotedMessage.downloadMedia();
        if (args.length === 1) {
            PersistantStorage.shared.banSticker(sticker);
            await message.reply('This sticker has been banned');
        } else if (args[1] === 'unban') {
            PersistantStorage.shared.unbanSticker(sticker);
            await message.reply('This sticker has been unbanned');
        }
    },
};

module.exports = command;
