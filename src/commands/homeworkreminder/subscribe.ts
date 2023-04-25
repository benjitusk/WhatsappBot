import { Message } from 'whatsapp-web.js';
import { Command, CustomClient } from '../../types';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import HomeworkManager from '../../HomeworkManager';
const creds = require('../../../googlecreds.json');
const doc = new GoogleSpreadsheet(
    '1P6I1UX82mVJnCr0BTjrlo_JTR5s8MK1QxiW6rgmwvvk'
);
const CLASSES_SHEET_ID = '128174630';

const command: Command = {
    name: 'subscribe',
    helpText: 'Subscribe to a class to receive homework reminders',
    syntax: '!subscribe {class number | class name}',
    enabled: true,
    admin: false,
    aliases: ['subscribe'],
    cooldown: 0,
    execute: async function (
        message: Message,
        client: CustomClient,
        args: string[]
    ): Promise<void> {
        const registeredStudent = HomeworkManager.shared.getStudentByID(
            message.from
        );
        if (registeredStudent === undefined) {
            message.reply(
                'You may not use this command until you are registered.'
            );
            return;
        }
        const classes: { [key: number]: string } = {};
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsById[CLASSES_SHEET_ID]; // The classes sheet
        await sheet.loadCells('A2:A999');
        for (let i = 2; i <= 999; i++) {
            const cell = sheet.getCell(i, 0);
            if (cell.value === null || cell.value === undefined) {
                break;
            }
            classes[i] = cell.value as string;
        }

        let className = args.slice(1).join(' ');
        const classNumber = Number(className);
        // check if the name is a number
        if (!isNaN(Number(className))) {
            className = classes[classNumber];
        }

        // Now that we have a name, check if it's valid
        if (!Object.values(classes).includes(className)) {
            message.reply(`Invalid class name or number. Please try again.`);
            return;
        }

        // Now that we have a valid class name, make sure the user isn't already subscribed
        if (registeredStudent.subscribedSubjects.includes(className)) {
            message.reply(
                `You are already subscribed to ${className}. To unsubscribe, type !unsubscribe ${className}.`
            );
            return;
        }

        // Subscribe the user
        registeredStudent.subscribedSubjects.push(className);
        // and reply
        message.reply(
            'You have been subscribed to ' +
                className +
                '. To unsubscribe, type !unsubscribe ' +
                className +
                '.'
        );
    },
};

module.exports = command;
