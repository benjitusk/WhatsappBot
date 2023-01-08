import { Client, WAState } from 'whatsapp-web.js';
import { MishnaYomi } from '../utils';
import { Contacts } from '../removedInfo';
import { MishnaIndex, MishnaYomiData, Task } from '../types';

const task: Task = {
	name: 'Mishna Yomi',
	enabled: true,
	seconds: '0',
	minutes: '0',
	hours: '15', // Offset because of timezone (3pm IST -> 8am EST)
	dayMonth: '*',
	month: '*',
	dayWeek: '*',
	silent: false,
	execute: async function (client: Client) {
		// let persistance = new PersistantStorage();
		let mishnayot: MishnaYomiData[] = [];

		// Get 2 mishnayot
		for (let i = 0; i < 2; i++) {
			// Get the mishna
			let mishna = await MishnaYomi.shared.fetchNextMishna();
			MishnaYomi.shared.incrementMishnaYomiIndex(MishnaIndex.MISHNA);
			if (!mishna) {
				// Create a large, noticable log message
				console.log(
					'*************************' +
						'**											**' +
						'**  MISHNA YOMI ERROR  **' +
						'**	  NO MISHNA FOUND   **' +
						'**											**' +
						'*************************'
				);
				return;
			}
			mishnayot.push(mishna as MishnaYomiData);
		}
		// Make sure it's not Shabbat.
		if (new Date().getDay() === 6) return;
		// Make sure the bot is in the correct state before sending the message.
		if ((await client.getState()) != WAState.CONNECTED) return;

		// get the chat object
		let chat = await client.getChatById(Contacts.SOTC_MISHNA_YOMI_CHAT_ID);

		// Send both mishnayot
		let shouldSendLinkPreview = true;
		for (let mishnaYomi of mishnayot) {
			let text = `*This Mishna Yomi message is powered by Sefaria.org*\n\n_${mishnaYomi.hebrewName}_\n${mishnaYomi.hebrew}\n\n_${mishnaYomi.englishName}_\n${mishnaYomi.english}`;
			await chat.sendMessage(text, { linkPreview: shouldSendLinkPreview });
		}
		console.log('[Mishna Yomi] Sent Mishna Yomi successfully');
	},
};

module.exports = task;
