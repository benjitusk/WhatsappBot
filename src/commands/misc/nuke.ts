import { ChatTypes, GroupChat, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { Users } from '../../utils';

const command: Command = {
	name: 'nuke',
	helpText: 'Remove every non-admin member from the group',
	syntax: 'nuke',
	enabled: false,
	admin: true,
	aliases: [],
	cooldown: 0,
	execute: async function (message: Message): Promise<void> {
		// make sure it's a group chat
		const group = (await message.getChat()) as GroupChat;
		if (!group.isGroup) {
			message.reply('This command can only be used in a group chat.');
			return;
		}
		let participantsToRemove = [];
		for (const participant of group.participants) {
			if (!participant.isAdmin) {
				Users.shared.saveBan(
					participant.id._serialized,
					group.id._serialized,
					1000 * 60 * 5,
					'Chat Nuke'
				);
				participantsToRemove.push(participant.id._serialized);
			}
		}
		group.removeParticipants(participantsToRemove);
	},
};

module.exports = command;
