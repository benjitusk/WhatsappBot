import prettyMilliseconds from 'pretty-ms';
import { Client, GroupChat, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { Users } from '../../utils';

const command: Command = {
	name: 'votekick',
	helpText: 'Initiate a votekick to remove the mentioned user',
	syntax: '!votekick @contact',
	enabled: true,
	admin: true,
	aliases: [],
	cooldown: 60 * 60 * 12, // 12 hours
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		// Check if a user was @mentioned
		const mentionedUser = await message.getMentions();
		if (mentionedUser.length !== 1) {
			message.reply(
				`Please @mention exactly 1 user to kick. You must wait ${prettyMilliseconds(
					this.cooldown * 1000,
					{
						secondsDecimalDigits: 0,
					}
				)} hours before you can use this command again.`
			);
			return;
		}

		// Get the @user's contact
		const userContact = mentionedUser[0];
		const userContactId = userContact.id._serialized;

		// Make sure the user is not an admin on the chat
		// Get chat admins
		const chat = (await message.getChat()) as GroupChat;
		if (!chat.isGroup) return;
		for (const user of chat.participants) if (user.isAdmin) return;

		if (Users.shared.userHasActiveVoteKick(userContactId, chat.id._serialized)) {
			message.reply(`A VoteKick is currently in progress for that user.`);
			return;
		}
		// Initialize the vote kick
		const voteKickID = Users.shared.initVoteKick(
			userContactId,
			chat.id._serialized,
			message.author!
		)!;
		message.reply(
			`@${userContact.number}'s fate is being decided... If 5 replies with "!kick" are received within 7 minutes, the user will be kicked.` +
				`\n\n*Votes that are not direct replies to this message will be ignored*\n\nVoteKickID: ${voteKickID}`,
			undefined,
			{
				mentions: [userContact],
			}
		);
	},
};

module.exports = command;
