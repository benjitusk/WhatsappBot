import { Contact, Message } from 'whatsapp-web.js';
import { Command, CustomClient, Student } from '../../types';
import HomeworkManager from '../../HomeworkManager';

const command: Command = {
    name: 'register',
    helpText: '',
    syntax: 'register',
    enabled: true,
    admin: false,
    aliases: ['register'],
    cooldown: 0,
    execute: async function (
        message: Message,
        client: CustomClient,
        args: string[]
    ): Promise<void> {
        // The username is the sender's name, split by spaces in args
        const username = args.slice(1).join(' ');

        // check if the user is already registered
        const registeredStudent = HomeworkManager.shared.getStudentByID(
            message.from
        );
        if (registeredStudent !== undefined) {
            // If the user is already registered, tell them we will update their name
            message.reply(
                `You are already registered as ${registeredStudent.name}! I will update your name to ${username}.`
            );
            registeredStudent.name = username;
            return;
        }

        const contact = await client.getContactById(message.from);

        const student: Student = {
            name: username,
            subscribedSubjects: [],
            id: message.from,
            _contact: { id: contact.id } as Contact,
        };

        // Update the database
        HomeworkManager.shared.setStudent(student);

        // Tell the user they have been registered
        message.reply(`You have been registered as ${username}.`);
    },
};

module.exports = command;
