import { readdirSync } from 'fs';
import { Client } from 'whatsapp-web.js';
import { Command } from '../types';

module.exports = (client: Client): void => {
	const commandFolders = readdirSync(`./commands`);
	for (const folder of commandFolders) {
		const commandFiles = readdirSync(`./commands/${folder}`).filter((file) => file.endsWith('.js'));
		for (const file of commandFiles) {
			const command = require(`../commands/${folder}/${file}`) as Command;
			if (command.enabled) {
				client.commands.set(command.name, command);
				console.log(`[Command] ${command.name} is enabled.`);
			} else {
				console.log(`[Command] ${command.name} is disabled.`);
			}
		}
	}
};
