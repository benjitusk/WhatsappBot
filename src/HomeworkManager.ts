import { Contact, Message } from 'whatsapp-web.js';
import { Assignment, CustomClient, HomeworkDatabase, Student } from './types';
import { getRelativePath } from './utils';
import { readFileSync, writeFileSync } from 'fs';
import prettyMilliseconds from 'pretty-ms';
import { Contacts, HomeworkAuth } from './removedInfo';
const HOMEWORK_DB_PATH = getRelativePath('../persistant/homework.json');

export default class HomeworkManager {
    private database: HomeworkDatabase;
    public static GOOGLE_SHEET_ID = HomeworkAuth.GOOGLE_SHEET_ID;
    public static OVERDUE_ALLOWANCE = 3 * 24 * 60 * 60 * 1000;
    private static CHAT_ID = Contacts.HOMEWORK_REMINDER_CHAT_ID;
    static shared = new HomeworkManager();

    static getAssignmentFromRow({
        id,
        subject,
        dueDate,
        assignment,
    }: {
        id: string;
        subject: string;
        dueDate: number;
        assignment: string;
    }): Assignment {
        return {
            subject: subject,
            dueDate,
            assignment: assignment,
            id: id,
            mutedBy: [],
            messageIDs: [],
            reminders: {
                initial: {
                    time: 0, // Send immediately
                    sent: this.shared.assignmentExists(id), // Only send if the assignment is new
                },
                week: {
                    time: dueDate - 604800000,
                    sent: dueDate < Date.now() + 604800000, // If the assignment is due in less than a week, don't send a reminder
                },
                day: {
                    time: dueDate - 86400000,
                    sent: dueDate < Date.now() + 86400000, // If the assignment is due in less than a day, don't send a reminder
                },
                hour: {
                    time: dueDate - 3600000,
                    sent: dueDate < Date.now() + 3600000, // If the assignment is due in less than an hour, don't send a reminder
                },
            },
        };
    }

    private constructor() {
        this.database = this.loadDatabase();
    }

    private loadDatabase(): HomeworkDatabase {
        return JSON.parse(
            readFileSync(HOMEWORK_DB_PATH, { encoding: 'utf-8' })
        ) as HomeworkDatabase;
    }

    private saveDatabase(database: HomeworkDatabase): void {
        writeFileSync(HOMEWORK_DB_PATH, JSON.stringify(database, null, 4));
    }

    private shouldSendReminder(assignment: Assignment): boolean {
        for (let reminder of Object.values(assignment.reminders)) {
            if (!reminder.sent && reminder.time < Date.now()) return true;
        }
        return false;
    }

    public sendAllReminders(client: CustomClient): void {
        for (let assignment of this.getAllAssignments()) {
            if (this.shouldSendReminder(assignment)) {
                this.alertChat(client, assignment);
                // Update the reminder
                for (let reminder of Object.values(assignment.reminders)) {
                    if (!reminder.sent && reminder.time < Date.now()) {
                        reminder.sent = true;
                        break;
                    }
                }
            }
        }
    }

    public clearOldAssignments(): void {
        const assignments = this.getAllAssignments();
        for (let assignment of assignments) {
            if (assignment.dueDate < Date.now()) {
                this.deleteAssignment(assignment.id);
            }
        }
    }

    public async alertChat(
        client: CustomClient,
        assignment: Assignment
    ): Promise<void> {
        const dueDate = new Date(assignment.dueDate);
        let message = `*${assignment.subject} Homework`;
        if (!assignment.reminders.initial.sent) message += ' (New) ✨';
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
        const studentsToNotify =
            this.getStudentsToNotifyForAssignment(assignment);
        for (let student of studentsToNotify) {
            // Since we don't want to spam WhatsApp and get banned, we'll wait a random amount of time between each fetch (0-5 seconds)
            await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 3000)
            );
            message += `@${student._contact.id.user}\n`;
            mentions.push(student._contact);
        }
        if (mentions.length === 0) message += 'Nobody';
        const whatsappMessage = await client.sendMessage(
            HomeworkManager.CHAT_ID,
            message,
            {
                mentions,
            }
        );
        assignment.messageIDs.push(whatsappMessage.id._serialized);
        this.setAssignment(assignment);
    }

    public getStudentByID(id: string): Student | undefined {
        return this.database.students[id];
    }

    public getAssignmentByID(id: string): Assignment | undefined {
        return this.database.assignments[id];
    }

    public setStudent(student: Student): void {
        this.database.students[student.id] = student;
        this.saveDatabase(this.database);
    }

    public setAssignment(assignment: Assignment): void {
        this.database.assignments[assignment.id] = assignment;
        this.saveDatabase(this.database);
    }

    public deleteStudent(id: string): void {
        delete this.database.students[id];
        this.saveDatabase(this.database);
    }

    public deleteAssignment(id: string): void {
        delete this.database.assignments[id];
        this.saveDatabase(this.database);
    }

    public studentExists(id: string): boolean {
        return this.database.students[id] !== undefined;
    }

    public assignmentExists(id: string): boolean {
        return this.database.assignments[id] !== undefined;
    }

    public getAllStudents(): Student[] {
        return Object.values(this.database.students);
    }

    public getAllAssignments(): Assignment[] {
        return Object.values(this.database.assignments);
    }

    public subscribeStudentToSubject(student: Student, subject: string): void {
        student.subscribedSubjects.push(subject);
        this.setStudent(student);
    }

    public getStudentsToNotifyForAssignment(assignment: Assignment): Student[] {
        const students = [] as Student[];
        for (const student of this.getAllStudents()) {
            // Check if the assignment is muted
            if (assignment.mutedBy.includes(student.id)) continue;
            // Check if the student is subscribed to the subject
            if (!student.subscribedSubjects.includes(assignment.subject))
                continue;
            students.push(student);
        }
        return students;
    }
}
