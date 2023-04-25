import { Message } from 'whatsapp-web.js';
import { Assignment, CustomClient, Command } from '../../types';
import { UUID } from '../../utils';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import HomeworkManager from '../../HomeworkManager';
const creds = require('../../../googlecreds.json');
const doc = new GoogleSpreadsheet(HomeworkManager.GOOGLE_SHEET_ID);

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
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        // Check for new assignments
        for (let row of rows) {
            const homeworkRow = {
                id: row.ID,
                subject: row.Subject,
                dueDate: row['Due Date'],
                assignment: row.Assignment,
            };
            // Check if the row is valid
            if (
                !(
                    homeworkRow.subject &&
                    homeworkRow.dueDate &&
                    homeworkRow.assignment
                )
            )
                continue;
            // Check if an ID is present
            if (!homeworkRow.id) {
                // If not, generate one
                homeworkRow.id = UUID();
                row.ID = homeworkRow.id;
                // Update the sheet
                row.save();
            }
            const dateTimestamp = new Date(row['Due Date'] as number).getTime();

            // Check if the assignment is already in the database
            let homework = HomeworkManager.shared.getAssignmentByID(
                homeworkRow.id
            );
            if (homework === undefined) {
                // Check if the assignment has been updated
                const homework: Assignment =
                    HomeworkManager.getAssignmentFromRow(homeworkRow);
                // Add the assignment to the database
                HomeworkManager.shared.setAssignment(homework);
                // ALERT THE POPULACE
                HomeworkManager.shared.alertChat(client, homework, true);
                return;
            }

            // If the assignment is already in the database, check if it has been updated
            if (
                homework.subject !== row.Subject ||
                homework.assignment !== row.Assignment ||
                homework.dueDate !== dateTimestamp
            ) {
                // Update the assignment
                let newHomework =
                    HomeworkManager.getAssignmentFromRow(homeworkRow);
                // Put the messageIDs in the new assignment
                newHomework.messageIDs = homework.messageIDs;
                // and copy the mutes
                newHomework.mutedBy = homework.mutedBy;

                // Update the database
                HomeworkManager.shared.setAssignment(newHomework);
            }

            HomeworkManager.shared.sendAllReminders(client);
        }
    },
};

module.exports = command;
