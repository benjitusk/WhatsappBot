import axios from 'axios';
import prettyMilliseconds from 'pretty-ms';
import { Location, Message } from 'whatsapp-web.js';
import { Client } from 'whatsapp-web.js';
import { Command } from '../../types';
const command: Command = {
    name: 'stop',
    helpText: 'Get the bus timetable for any given stop.',
    syntax: '!bus < Stop ID >',
    enabled: true,
    admin: false,
    aliases: ['stop'],
    cooldown: 0, // 0 minutes
    execute: async function (
        message: Message,
        client: Client,
        args: string[]
    ): Promise<void> {
        let chatID: string | undefined;
        if (message.author) {
            const contact = await message.getContact();
            const chat = await contact.getChat();
            chatID = chat.id._serialized;
        }
        if (args.length < 2) {
            message.reply('Please specify a bus stop ID.', chatID);
            return;
        }
        const stopIDString = args[1];
        // ensure bus number is a number
        if (isNaN(parseInt(stopIDString))) {
            message.reply(
                'Please specify a valid bus stop ID. (Must be a number)',
                chatID
            );
            return;
        }
        const stopIDNumber = parseInt(stopIDString);

        try {
            const response = await axios.get(
                `https://curlbus.app/${stopIDNumber}`,
                {
                    headers: { Accept: 'plain/text' },
                }
            );
            let data = response.data;

            data =
                'You may need to rotate your device sideways to view this chart properly.\n\n```' +
                data +
                '```';

            message.reply(data, chatID);
        } catch (error) {
            message.reply('Invalid StopID: ' + stopIDNumber + '.', chatID);
            return;
        }
    },
};

module.exports = command;
