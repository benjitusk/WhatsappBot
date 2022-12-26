import { Message, MessageMedia } from 'whatsapp-web.js';
import { Command } from '../../types';

const command: Command = {
	name: 'binny',
	helpText: 'Operation B.I.N.D.O.G.',
	syntax: 'binny',
	enabled: false,
	admin: false,
	aliases: ['binny', 'bindog', 'bunny'],
	cooldown: 20,
	// 🌭 🐰
	execute: function (message: Message): void {
		// pick a random number between 1 and 3
		let random = Math.floor(Math.random() * 3) + 1;
		switch (random) {
			case 1:
				message.reply('🌭');
				break;
			case 2:
				message.reply('🐰');
				break;
			case 3:
				let media = MessageMedia.fromFilePath('../media/binny.ogg');
				message.reply(media, undefined, { sendAudioAsVoice: true });
		}
	},
};

module.exports = command;
