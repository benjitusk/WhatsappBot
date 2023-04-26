import { Message } from 'whatsapp-web.js';
import { Command, CustomClient } from '../../types';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import HomeworkManager from '../../HomeworkManager';
import { HomeworkAuth } from '../../removedInfo';
const creds = require('../../../googlecreds.json');
const doc = new GoogleSpreadsheet(HomeworkManager.GOOGLE_SHEET_ID);

const command: Command = {
    name: 'subscribe',
    helpText: 'Subscribe to a class to receive homework reminders',
    syntax: '!subscribe <class number> [...<class number>]',
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
        const sheet = doc.sheetsById[HomeworkAuth.METADATA_SHEET_ID]; // The classes sheet
        await sheet.loadCells('A2:A999');
        for (let i = 2; i <= 999; i++) {
            const cell = sheet.getCell(i, 0);
            if (cell.value === null || cell.value === undefined) {
                break;
            }
            classes[i] = cell.value as string;
        }

        const classNumbers = args.slice(1).map((classNumber) => {
            return Number(classNumber);
        });
        // check that all numbers are valid
        let valid = classNumbers.every(
            (classNumber) =>
                !Number.isNaN(classNumber) && classes[classNumber] !== undefined
        );

        // Now that we have a name, check if it's valid
        if (!valid) {
            message.reply(`Invalid class name or number. Please try again.`);
            return;
        }

        // // Now that we have a valid class name, make sure the user isn't already subscribed
        // if (registeredStudent.subscribedSubjects.includes(classes)) {
        //     message.reply(
        //         `You are already subscribed to ${className}. To unsubscribe, type !unsubscribe ${className}.`
        //     );
        //     return;
        // }

        // Subscribe the user
        classNumbers.forEach((number) => {
            registeredStudent.subscribedSubjects.push(classes[number]);
        });

        HomeworkManager.shared.setStudent(registeredStudent);
        // and reply
        message.reply(
            'You have been subscribed to the following subjects:\n' +
                classNumbers
                    .map((number, i) => {
                        return `${i + 1}) ${classes[number]}${
                            i === classNumbers.length - 1 ? '' : ', '
                        }`;
                    })
                    .join('\n') +
                '\n\nTo unsubscribe, type !unsubscribe <class number> [...<class number>]' +
                '\nwhere <class number> corresponds to the number next to the class in the *!list* command.'
        );
    },
};

module.exports = command;
