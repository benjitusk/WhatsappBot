import { Client, WAState } from 'whatsapp-web.js';
import { MishnaYomi } from '../utils';
import { chats } from '../removedInfo';
import { MishnaIndex, MishnaYomiData, Task } from '../types';

const task: Task = {
	name: 'Mishna Yomi',
	// 8:30am every day
	enabled: true,
	seconds: '0',
	minutes: '30',
	hours: '8',
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
		let chat = await client.getChatById(chats.MISHNA_YOMI_CHAT_ID);

		// Send both mishnayot
		for (const [i, mishnaYomi] of mishnayot.entries()) {
			let text = `*This Mishna Yomi message is powered by Sefaria.org*\n\n_${mishnaYomi.hebrewName}_\n${mishnaYomi.hebrew}\n\n_${mishnaYomi.englishName}_\n${mishnaYomi.english}`;
			await chat.sendMessage(text, { linkPreview: i == 0 });
		}
		console.log('[Mishna Yomi] Sent Mishna Yomi successfully');
	},
};

module.exports = task;
