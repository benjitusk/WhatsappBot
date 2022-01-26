import { Client, Message } from 'whatsapp-web.js';
import { Command } from '../../types';

const command: Command = {
	name: 'help',
	helpText: 'Get a list of commands, descriptions, and syntax',
	syntax: 'help',
	enabled: true,
	admin: false,
	aliases: [],
	cooldown: 60 * 60 * 1, // 1 hour
	execute: function (message: Message, client: Client, args: string[]): void {
		// For each command, format the help text
		// But only include aliases if there are any
		const responseText = client.commands.map((command: Command) => {
			let text =
				`*!${command.name}* - ${command.helpText}` +
				`\n\tSyntax: \`\`\`${command.syntax}\`\`\`` +
				`\n\tEnabled: ${command.enabled}`;

			if (command.aliases.length > 0)
				text += `\n\tAliases: [${command.aliases.join(', ')}]`;
			if (command.admin) text += `\n\t_Reserved command_`;
			return text;
		});
		// Send the help text
		message.reply(responseText.join('\n\n'), undefined, { linkPreview: false });
	},
};

module.exports = command;
