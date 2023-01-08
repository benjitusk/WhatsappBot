import { Message } from 'whatsapp-web.js';
import { Filter } from '../types';
import { md5, PersistantStorage } from '../utils';

const filter: Filter = {
    name: 'bannedsticker',
    enabled: true,
    cooldown: 0,
    timeout: 60 * 60 * 5, // 5 hours
    tolerance: 0,
    reason: 'sending a banned sticker',
    test: async function (message: Message): Promise<boolean> {
        if (message.type != 'sticker') return false;
        const sticker = await message.downloadMedia();
        return PersistantStorage.shared.isStickerBanned(sticker);
    },
};

module.exports = filter;
