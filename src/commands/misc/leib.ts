import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';

const command: Command = {
    name: 'leib',
    helpText: 'Welcome Leib to Shraga!',
    syntax: 'leib',
    enabled: false,
    admin: false,
    aliases: ['leib'],
    cooldown: 0,
    execute: function (message: Message): void {
        // Pick a random emoji from the following: 🥳 👏 🇦🇺
        const emojis = ['🥳', '👏', '🇦🇺'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        message.reply(emoji);
    },
};

module.exports = command;
