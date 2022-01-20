import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import { Command } from '../../types';
import textToSpeech from '@google-cloud/text-to-speech';

const command: Command = {
	name: 'birnbaum',
	enabled: false,
	admin: false,
	aliases: ["bri'ish", 'british'],
	cooldown: 0,
	execute: async function (message: Message, client: Client, args: string[]): Promise<void> {
		const fs = require('fs');
		const util = require('util');
		// Creates a client
		const ttsClient = new textToSpeech.TextToSpeechClient({
			keyFilename: '../whatsapp.json',
		});
		args.shift();
		args.join(' ');
		// The text to synthesize
		const text = args;

		// Construct the request
		const request = {
			input: { text: text },
			// Select en-IN-Wavenet-C
			voice: { languageCode: 'en-GB', name: 'en-GB-Wavenet-D' },
			// select the type of audio encoding
			audioConfig: {
				audioEncoding: 'OGG_OPUS',
				speakingRate: 1.3,
			},
			// set the accent
		};

		// Performs the text-to-speech request
		const [response] = await ttsClient.synthesizeSpeech(request as any);
		// Write the binary audio content to a local file
		const writeFile = util.promisify(fs.writeFile);
		await writeFile('../media/british.ogg', response.audioContent, 'binary');
		// console.log('Audio content written to file: output.mp3');
		let media = MessageMedia.fromFilePath('../media/british.ogg');
		message.reply(media, undefined, { sendAudioAsVoice: true });
	},
};

module.exports = command;
