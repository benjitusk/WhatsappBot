import { Message } from 'whatsapp-web.js';
import { Command, CustomClient, HomeworkDatabase } from '../../types';
import { getRelativePath } from '../../utils';
import fs from 'fs';
const HOMEWORK_DB_PATH = getRelativePath('../persistant/homework.json');

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
        // Open the homework database
        const homeworkDB = JSON.parse(
            fs.readFileSync(HOMEWORK_DB_PATH, { encoding: 'utf-8' })
        ) as HomeworkDatabase;
        // The username is the sender's name, split by spaces in args
        const username = args.slice(1).join(' ');
        // If the user is already registered, tell them we will update their name
        if (homeworkDB.students[message.from] !== undefined) {
            message.reply(
                `You are already registered as ${
                    homeworkDB.students[message.from]
                }! I will update your name to ${username}.`
            );
            homeworkDB.students[message.from].name = username;
            return;
        }
        // Update the database
        homeworkDB.students[message.from] = {
            name: username,
            subscribedSubjects: [],
            whatsappID: message.from,
        };
        // Write the database to the file
        fs.writeFileSync(HOMEWORK_DB_PATH, JSON.stringify(homeworkDB, null, 4));

        message.reply(`You have been registered as ${username}.`);
    },
};

module.exports = command;
