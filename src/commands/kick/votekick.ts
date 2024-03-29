import prettyMilliseconds from 'pretty-ms';
import { Buttons, GroupChat, Message } from 'whatsapp-web.js';
import { Command, CustomClient } from '../../types';
import { Users } from '../../utils';

const command: Command = {
    name: 'votekick',
    helpText: 'Initiate a votekick to remove the mentioned user',
    syntax: '!votekick @contact',
    enabled: false,
    admin: false,
    aliases: ['votekick'],
    cooldown: 60 * 60 * 2 * 24, // 2 days
    execute: async function (
        message: Message,
        client: CustomClient,
        args: string[]
    ): Promise<void> {
        // Check if a user was @mentioned
        const mentionedUser = await message.getMentions();
        if (mentionedUser.length !== 1) {
            message.reply(
                `Please @mention exactly 1 user to votekick. You must wait ${prettyMilliseconds(
                    this.cooldown * 1000,
                    {
                        secondsDecimalDigits: 0,
                    }
                )} before you can use this command again.`
            );
            return;
        }

        // Get the @user's contact
        const userContact = mentionedUser[0];
        const userContactId = userContact.id._serialized;

        // Make sure the user is not an admin on the chat
        // Get chat admins
        const chat = (await message.getChat()) as GroupChat;
        if (!chat.isGroup) {
            console.log(`${chat.name} is not a group, skipping...`);
        }
        for (const user of chat.participants)
            if (user.id._serialized === userContactId) {
                if (user.isAdmin) {
                    console.log(
                        `${userContact.number} is an admin on ${chat.name}, skipping...`
                    );
                    return;
                }
                break;
            }

        if (
            Users.shared.userHasActiveVoteKick(
                userContactId,
                chat.id._serialized
            )
        ) {
            message.reply(`A VoteKick is currently in progress for that user.`);
            return;
        }
        // Initialize the vote kick
        const voteKickID = Users.shared.initVoteKick(
            userContactId,
            chat.id._serialized,
            message.author!
        )!;
        Users.shared.voteKickVote(message.author!, voteKickID, client);

        let vcButton = new Buttons(
            `${
                userContact.name || userContact.pushname || userContact.number
            }'s fate is being decided... If ${
                Users.VOTEKICKCOUNT - 1
            } replies with "!🥾" are received within 7 minutes, the user will be kicked.`,
            [{ id: voteKickID, body: '!🥾' }],
            `Vote Kick`,
            `Votes that are not sent via this button will be ignored.`
        );
        message.reply(vcButton);
    },
};

module.exports = command;
