import { Message } from 'whatsapp-web.js';
import { Assignment, CustomClient, Task } from '../types';
import { UUID } from '../utils';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import HomeworkManager from '../HomeworkManager';
const creds = require('../../googlecreds.json');
const doc = new GoogleSpreadsheet(HomeworkManager.GOOGLE_SHEET_ID);
const task: Task = {
    name: 'homeworkspreadsheet',
    enabled: true,
    seconds: '0',
    minutes: '*/5',
    hours: '*',
    dayMonth: '*',
    month: '*',
    dayWeek: '0-6',
    silent: false,
    execute: async function (client: CustomClient): Promise<void> {
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        // Check for new assignments
        for (let row of rows) {
            const homeworkRow = {
                id: row.ID as string,
                subject: row.Subject as string,
                dueDate: new Date(row['Due Date']).getTime(),
                assignment: row.Assignment as string,
            } as Assignment;
            // Check if the row is valid
            if (
                !(
                    homeworkRow.subject &&
                    homeworkRow.dueDate &&
                    homeworkRow.assignment
                )
            )
                continue;
            // Check if row is expired
            if (
                homeworkRow.dueDate <
                Date.now() + HomeworkManager.OVERDUE_ALLOWANCE
            ) {
                row.delete();
                continue;
            }

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
            } else if (
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
        }
        HomeworkManager.shared.sendAllReminders(client);
        HomeworkManager.shared.clearOldAssignments();
    },
};

module.exports = task;
