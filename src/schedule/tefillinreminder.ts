import { Client, WAState } from 'whatsapp-web.js';
import { MishnaYomi } from '../utils';
import { Contacts } from '../removedInfo';
import { MishnaIndex, MishnaYomiData, Task } from '../types';

const task: Task = {
    name: 'TefillinReminder',
    enabled: true,
    seconds: '0',
    minutes: '30',
    hours: '6',
    dayMonth: '*',
    month: '*',
    dayWeek: '0-6',
    silent: false,
    execute: async function (client: Client) {
        const goldman = await client.getContactById(Contacts.MICHAEL_GOLDMAN);
        const chat = await goldman.getChat();
        await chat.sendMessage(
            "Good morning, Rav! Here's a reminder to send a text about Teffilin."
        );
        console.log(
            '[TefillinReminder] Sent message to Michael Goldman successfully'
        );
    },
};

module.exports = task;
