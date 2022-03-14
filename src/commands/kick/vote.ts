import { Client, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { Users } from '../../utils';

const command: Command = {
	name: '🥾',
	helpText: 'Reply to a votekick bot message to vote.',
	syntax: '!🥾',
	enabled: true,
	admin: false,
	aliases: ['boot'],
	cooldown: 0,
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		if (message.type !== 'buttons_response') {
			message.reply(`You must vote via a votekick bot message.`);
			return;
		}
		// Get the vote kick ID
		const id = message.selectedButtonId;
		if (!id) {
			message.reply('You must reply to a votekick bot message to vote.');
			return;
		}

		// Get the vote kick
		let voteKick = Users.shared.getVoteKickByID(id);
		if (!voteKick || voteKick.voteExpires < Date.now()) {
			return;
		}

		// Vote
		Users.shared.voteKickVote(message.author!, id, client);

		// Reply with the number of votes
		// update votekick object b/c it _may_ have changed
		let updatedVoteKick = Users.shared.getVoteKickByID(id);
		if (!updatedVoteKick) {
			const contact = await client.getContactById(voteKick.userID)!;
			message.reply(
				`@${contact.number} has been kicked from this chat for 1 hour. This vote is no longer active.`,
				undefined,
				{
					mentions: [contact],
				}
			);
		} else {
			message.reply(`${updatedVoteKick?.votes.length}/${Users.VOTEKICKCOUNT} votes received.`);
		}
	},
};

module.exports = command;
