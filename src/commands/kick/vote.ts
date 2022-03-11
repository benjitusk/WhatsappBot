import { Client, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { Users } from '../../utils';

const command: Command = {
	name: '🥾',
	helpText: 'Reply to a votekick bot message to vote.',
	syntax: '!🥾',
	enabled: true,
	admin: false,
	aliases: ['vote'],
	cooldown: 0,
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		// Get quoted message
		const quotedMessage = await message.getQuotedMessage();
		if (!quotedMessage || !quotedMessage.fromMe) {
			message.reply('You must reply to a votekick bot message to vote.');
			return;
		}

		// Get the vote kick ID
		const id = quotedMessage.body.split('VoteKickID: ')[1];
		if (!id) {
			message.reply('You must reply to a votekick bot message to vote.');
			return;
		}

		// Get the vote kick
		let voteKick = Users.shared.getVoteKickByID(id);
		if (!voteKick || voteKick.voteExpires < Date.now()) {
			message.reply('This votekick expired or does not exist.');
			return;
		}

		// Vote
		Users.shared.voteKickVote(message.author!, id, client);

		// Reply with the number of votes
		// update votekick object b/c it _may_ have changed
		voteKick = Users.shared.getVoteKickByID(id);

		message.reply(`${voteKick?.votes.length}/${Users.VOTEKICKCOUNT} votes received.`);
		return;
	},
};

module.exports = command;