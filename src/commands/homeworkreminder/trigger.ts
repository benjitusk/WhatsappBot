import { Message } from 'whatsapp-web.js';
import {
    Assignment,
    CustomClient,
    HomeworkDatabase,
    Command,
} from '../../types';
import fs from 'fs';
import { Contact } from 'whatsapp-web.js';
import { Contacts } from '../../removedInfo';
import prettyMilliseconds from 'pretty-ms';
import { UUID, getAssignmentFromRow, getRelativePath } from '../../utils';
import { GoogleSpreadsheet } from 'google-spreadsheet';
const creds = require('../../../googlecreds.json');
const HOMEWORK_DB_PATH = getRelativePath('../persistant/homework.json');
const doc = new GoogleSpreadsheet(
    '1P6I1UX82mVJnCr0BTjrlo_JTR5s8MK1QxiW6rgmwvvk'
);

const command: Command = {
    name: 'homework',
    helpText: 'trigger the homework check',
    syntax: '!homework',
    enabled: true,
    admin: true,
    aliases: ['homework'],
    cooldown: 0,
    execute: async function (
        message: Message,
        client: CustomClient,
        args: string[]
    ): Promise<void> {
        let homeworkDB = JSON.parse(
            fs.readFileSync(HOMEWORK_DB_PATH, { encoding: 'utf-8' })
        ) as HomeworkDatabase;

        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        // Check for new assignments
        for (let row of rows) {
            let id = row.ID as string;
            // Check if the row is valid
            if (!(row.Subject && row['Due Date'] && row.Assignment)) continue;
            // Check if an ID is present
            if (!id) {
                // If not, generate one
                id = UUID();
                row.ID = id;
                // Update the sheet
                row.save();
            }
            const dateTimestamp = new Date(row['Due Date'] as number).getTime();

            // Check if the assignment is already in the database
            if (homeworkDB.assignments[id]) {
                const homework = homeworkDB.assignments[id];
                // Check if the assignment has been updated
                if (
                    homework.subject !== row.Subject ||
                    homework.assignment !== row.Assignment ||
                    homework.dueDate !== dateTimestamp
                ) {
                    // Update the assignment
                    let newHomework = getAssignmentFromRow(
                        row.ID,
                        row.Subject,
                        row['Due Date'],
                        row.Assignment
                    );
                    // Put the messageIDs in the new assignment
                    newHomework.messageIDs = homework.messageIDs;
                    // and copy the mutes
                    newHomework.mutedBy = homework.mutedBy;

                    // Update the database
                    homeworkDB.assignments[id] = newHomework;
                    // Write the database to the file
                    fs.writeFileSync(
                        HOMEWORK_DB_PATH,
                        JSON.stringify(homeworkDB, null, 4)
                    );
                }

                // Check if we need to send a reminder
                for (let [reminderName, reminder] of Object.entries(
                    homeworkDB.assignments[id].reminders
                )) {
                    if (
                        (!reminder.sent && reminder.time < Date.now()) ||
                        reminderName === 'day'
                    ) {
                        // Send a reminder
                        const sentMessage = await alertChat(
                            client,
                            Contacts.HOMEWORK_REMINDER_CHAT_ID,
                            homeworkDB.assignments[id],
                            false
                        );
                        homeworkDB.assignments[id].reminders[
                            reminderName
                        ].sent = true;
                        homeworkDB.assignments[id].messageIDs.push(
                            sentMessage.id._serialized
                        );
                        // Write the database to the file
                        fs.writeFileSync(
                            HOMEWORK_DB_PATH,
                            JSON.stringify(homeworkDB, null, 4)
                        );

                        break;
                    }
                }
            } else {
                const homework: Assignment = getAssignmentFromRow(
                    row.ID,
                    row.Subject,
                    row['Due Date'],
                    row.Assignment
                );
                // ALERT THE POPULACE
                const message = await alertChat(
                    client,
                    Contacts.HOMEWORK_REMINDER_CHAT_ID,
                    homework,
                    true
                );
                homework.messageIDs.push(message.id._serialized);
                homeworkDB.assignments[id] = homework;

                // Write the database to the file
                fs.writeFileSync(
                    HOMEWORK_DB_PATH,
                    JSON.stringify(homeworkDB, null, 4)
                );
            }
        }
    },
};
async function alertChat(
    client: CustomClient,
    chat: string,
    assignment: Assignment,
    isNew: boolean
): Promise<Message> {
    let homeworkDB = JSON.parse(
        fs.readFileSync(HOMEWORK_DB_PATH, { encoding: 'utf-8' })
    ) as HomeworkDatabase;

    const dueDate = new Date(assignment.dueDate);
    let message = `*${assignment.subject} Homework`;
    if (isNew) message += ' (New)';
    message += '*\n\n';
    message += `*Assignment*: ${assignment.assignment}\n`;
    message += `*Due Date*: ${dueDate.toDateString()} ${dueDate.toTimeString()}\n`;
    message += `*Time Remaining*: ${prettyMilliseconds(
        dueDate.getTime() - Date.now(),
        { verbose: true, compact: true }
    )}\n`;
    message += `_React with 🔕 to mute this assignment_\n`;
    message += 'Attn to:\n';
    const mentions = [] as Contact[];
    for (const [whatsappID, student] of Object.entries(homeworkDB.students)) {
        // Check if the assignment is muted
        if (assignment.mutedBy.includes(whatsappID)) continue;
        // Check if the student is subscribed to the subject
        if (!student.subscribedSubjects.includes(assignment.subject)) continue;
        // Since we don't want to spam WhatsApp and get banned, we'll wait a random amount of time between each fetch (0-5 seconds)
        await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 3000)
        );
        const contact = {
            id: {
                server: 'c.us',
                user: whatsappID.split('@')[0],
                _serialized: whatsappID,
            },
        } as Contact;

        message += `@${contact.id.user}\n`;
        mentions.push(contact);
    }
    if (mentions.length === 0) message += 'Nobody';
    return client.sendMessage(chat, message, { mentions });
}

module.exports = command;
