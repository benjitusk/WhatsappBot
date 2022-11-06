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
		let text = 'These are the commands currently supported:\n';
		text += "_Here's how to interpret the syntax:_\n";
		text += '```<required> [optional] {reqired | choices}```\n\n\n';
		// For each command, format the help text
		// But only include aliases if there are any
		const responseText = client.commands.map((command: Command) => {
			if (!command.enabled) return null;
			let commandText =
				`*!${command.name}* - ${command.helpText}` + `\n\tSyntax: \`\`\`${command.syntax}\`\`\``;

			if (command.aliases.length > 0) commandText += `\n\tAliases: [${command.aliases.join(', ')}]`;
			if (command.admin) commandText += `\n\t_Reserved command_`;
			return commandText;
		}) as (string | null)[];
		// Send the help text
		message.reply(text + responseText.filter(Boolean).join('\n\n'), undefined, {
			linkPreview: false,
		});
	},
};

module.exports = command;
