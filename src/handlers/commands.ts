import Collection from '@discordjs/collection';
import { readdirSync } from 'fs';
import { Client } from 'whatsapp-web.js';
import { Command } from '../types';
import { Bot } from '../utils';

module.exports = (client: Client): void => {
    // clear existing commands
    client.commands = new Collection();
    const commandFolders = readdirSync(`./commands`);
    for (const folder of commandFolders) {
        const commandFiles = readdirSync(`./commands/${folder}`).filter(
            (file) => file.endsWith('.js')
        );
        for (const file of commandFiles) {
            const command = require(`../commands/${folder}/${file}`) as Command;
            if (command.__esModule)
                throw new Error(
                    `commands/${folder}/${file} is missing module.exports`
                );
            if (command.name.split(' ').length > 1)
                throw new Error(
                    `commands/${folder}/${file} has a space in the name`
                );
            client.commands.set(command.name, command);
            let savedState = Bot.shared.getFeatureState(command.name);
            if (savedState === undefined) {
                Bot.shared.setFeatureState(
                    command.name,
                    command.enabled,
                    client
                );
            } else command.enabled = savedState;
            if (command.enabled) {
                console.log(`[Command] enabled ${command.name}.`);
            } else {
                console.log(`[Command] DISABLED ${command.name}.`);
            }
        }
    }
};
