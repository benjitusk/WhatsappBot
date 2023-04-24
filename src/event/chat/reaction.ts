import { Reaction } from 'whatsapp-web.js';
import { CustomClient, ReactionHandler } from '../../types';
import { readdirSync } from 'fs';
module.exports = {
    name: 'message_reaction',
    once: false,
    async execute(reaction: Reaction, client: CustomClient) {
        const eventFiles = readdirSync(`./reactions`).filter((file) =>
            file.endsWith('.js')
        );
        for (const file of eventFiles) {
            const handler =
                require(`../../reactions/${file}`) as ReactionHandler;
            if (reaction.reaction === handler.emoji)
                handler.execute(reaction, client);
        }
    },
};
