import { readdirSync } from 'fs';
import { Client, Message } from 'whatsapp-web.js';

interface Command {
	name: string;
	aliases?: string[];
	cooldown?: number;
	execute: (message: Message, client: Client) => void;
}

module.exports = (client: Client): void => {
	const commandFolders = readdirSync(`./commands`).filter((file) => file.endsWith('.js'));
	for (const folder of commandFolders) {
		const commandFiles = readdirSync(`./commands/${folder}`).filter((file) => file.endsWith('.js'));
		for (const file of commandFiles) {
			const command = require(`../commands/${folder}/${file}`) as Command;
			client.commands.set(command.name, command);
		}
	}
};
