import { Client, Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { md5, PersistantStorage } from '../../utils';

const command: Command = {
	name: 'bansticker',
	helpText: 'adds a sticker to the banned list',
	syntax: 'bansticker [unban]',
	enabled: true,
	admin: true,
	aliases: [],
	cooldown: 0,
	execute: async function (
		message: Message,
		client: Client,
		args: string[]
	): Promise<void> {
		const quotedMessage = await message.getQuotedMessage();
		if (!quotedMessage) return;
		const stickerBase64 = (await quotedMessage.downloadMedia()).data;
		const stickerMD5 = md5(stickerBase64);
		const persistantStorage = new PersistantStorage();
		let storage = persistantStorage.get();
		if (args.length === 1) {
			storage.bannedStickerMD5s.push(stickerMD5);
			persistantStorage.set(storage);
			await message.reply('This sticker has been banned');
		} else if (args[2] === 'unban') {
			storage.bannedStickerMD5s = storage.bannedStickerMD5s.filter(
				(md5) => md5 !== stickerMD5
			);
			persistantStorage.set(storage);
			await message.reply('This sticker has been unbanned');
		}
	},
};

module.exports = command;
