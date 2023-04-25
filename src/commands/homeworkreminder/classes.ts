import { Message } from 'whatsapp-web.js';
import { Command, CustomClient } from '../../types';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import HomeworkManager from '../../HomeworkManager';
import { HomeworkAuth } from '../../removedInfo';
const creds = require('../../../googlecreds.json');
const doc = new GoogleSpreadsheet(HomeworkManager.GOOGLE_SHEET_ID);

const command: Command = {
    name: 'classes',
    helpText: '',
    syntax: '',
    enabled: true,
    admin: false,
    aliases: ['classes'],
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
            message.reply("You're not registered yet.");
            return;
        }

        // This will list all the classes a user can subscribe to
        const classes = [];
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsById[HomeworkAuth.METADATA_SHEET_ID]; // The classes sheet
        await sheet.loadCells('A2:A999');
        for (let i = 2; i <= 999; i++) {
            const cell = sheet.getCell(i, 0);
            if (cell.value === null || cell.value === undefined) {
                break;
            }
            classes.push(`${i - 1}) ${cell.value}`);
        }
        message.reply(
            `Here are the classes you can subscribe to:\n${classes
                .map((c) =>
                    registeredStudent.subscribedSubjects.includes(
                        c.split(') ')[1]
                    )
                        ? `*${c} ✨*`
                        : c
                )
                .join(
                    '\n'
                )}\n\nYou can subscribe to a class by typing !subscribe <class number> or !subscribe <class name>.`
        );
    },
};

module.exports = command;
