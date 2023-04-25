import { Message } from 'whatsapp-web.js';
import { Command, CustomClient } from '../../types';
import HomeworkManager from '../../HomeworkManager';

const command: Command = {
    name: 'unsubscribe',
    helpText: 'Unsubscribe from a class to stop receiving homework reminders',
    syntax: '!unsubscribe {class number | class name}',
    enabled: true,
    admin: false,
    aliases: ['unsubscribe'],
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
        let className = args.slice(1).join(' ');
        const classNumber = Number(className);
        // check if the name is a number
        if (!isNaN(Number(className))) {
            className = registeredStudent.subscribedSubjects[classNumber - 1]; // -1 because the first class is 1, not 0
        }

        // Now that we have a name, check if it's valid
        if (!registeredStudent.subscribedSubjects.includes(className)) {
            message.reply(
                `You are not subscribed to that class. No changes have been made.`
            );
            return;
        }

        // Unsubscribe the user
        registeredStudent.subscribedSubjects =
            registeredStudent.subscribedSubjects.filter(
                (subject) => subject !== className
            );
        HomeworkManager.shared.setStudent(registeredStudent);
        // and reply
        message.reply(
            'You have been unsubscribed from ' +
                className +
                '. To resubscribe, type !subscribe ' +
                className +
                '.'
        );
    },
};

module.exports = command;
