import { Message } from 'whatsapp-web.js';
import { Command, CustomClient } from '../../types';
import HomeworkManager from '../../HomeworkManager';

const command: Command = {
    name: 'unsubscribe',
    helpText: 'Unsubscribe from a class to stop receiving homework reminders',
    syntax: '!unsubscribe <class number> [...<class number>]',
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
        let classNumberStrings = args.slice(1);
        const classNumbers = classNumberStrings.map((classNumber) =>
            Number(classNumber)
        );
        if (classNumbers.some((classNumber) => isNaN(classNumber))) {
            message.reply(`Invalid class number. Please try again.`);
            return;
        }
        const classNames = classNumbers.map(
            (classNumber) =>
                registeredStudent.subscribedSubjects[classNumber - 1]
        );
        registeredStudent.subscribedSubjects =
            registeredStudent.subscribedSubjects.filter(
                (subject) => !classNames.includes(subject)
            );

        HomeworkManager.shared.setStudent(registeredStudent);
        // and reply
        message.reply(
            'You have been unsubscribed from\n' +
                classNames
                    .map((name, i) => {
                        return `${i + 1}) ${name}`;
                    })
                    .join('\n') +
                '\n\n' +
                'To resubscribe, use the !subscribe command.'
        );
    },
};

module.exports = command;
