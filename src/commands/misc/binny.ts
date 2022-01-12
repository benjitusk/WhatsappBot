import { Message, MessageMedia } from 'whatsapp-web.js';
import { Command } from '../../types';

const command: Command = {
	name: 'binny',
	enabled: true,
	admin: false,
	aliases: ['bindog'],
	cooldown: 0,
	// 🌭 🐰
	execute: function (message: Message): void {
		// pick a random number between 1 and 3
		let random = 3; //Math.floor(Math.random() * 3) + 1;
		switch (random) {
			case 1:
				message.reply('🌭');
				break;
			case 2:
				message.reply('🐰');
				break;
			case 3:
				let media = MessageMedia.fromFilePath('../media/binny.ogg');
				message.reply(media);
		}
	},
};

module.exports = command;