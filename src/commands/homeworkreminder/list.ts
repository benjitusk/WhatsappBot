import { Message } from 'whatsapp-web.js';
import { Command, CustomClient } from '../../types';
import HomeworkManager from '../../HomeworkManager';

const command: Command = {
    name: 'list',
    helpText: 'List the classes you are subscribed to',
    syntax: '!list',
    enabled: true,
    admin: false,
    aliases: ['list'],
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
        message.reply(`You are subscribed to the following classes:\n${registeredStudent.subscribedSubjects
            .map((c, i) => `*${i + 1}) ${c}*`)
            .join('\n')}
        \nTo unsubscribe from a class, type !unsubscribe <#> [...<#>]\nwhere \`\`\`<#>\`\`\` corresponds to the number of the class in *this list*.
        `);
    },
};

module.exports = command;
