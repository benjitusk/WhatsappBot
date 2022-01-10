import { Client, WAState } from 'whatsapp-web.js';
import { getMishnaYomi, PersistantStorage, MishnaYomi, Task } from '../utils';
import { chats } from '../removedInfo';

interface MishnaTracker {
	book: number;
	perek: number;
	mishna: number;
	books: [string];
}

const task: Task = {
	name: 'Mishna Yomi',
	// 8:30am every day
	enabled: true,
	seconds: '*',
	minutes: '30',
	hours: '8',
	dayMonth: '*',
	month: '*',
	dayWeek: '*',
	execute: async function (client: Client) {
		let persistance = new PersistantStorage();
		let mishnayot: MishnaYomi[] = [];

		// Get 2 mishnayot
		for (let i = 0; i < 2; i++) {
			// Get the counter object
			let mishnaTracker = persistance.get('mishnaYomi') as MishnaTracker;
			// Get the mishna
			let mishnaYomi = await getMishnaYomi(
				mishnaTracker.books[mishnaTracker.book],
				mishnaTracker.perek,
				mishnaTracker.mishna
			);

			// Handle any errors
			let retryCount = 0;
			while (typeof mishnaYomi === 'string') {
				if (retryCount > 5) {
					console.error(`[Mishna Yomi] Couldn't get mishnaYomi. ${mishnaYomi}`);
					return;
				}

				// An error occured.
				retryCount++;
				// An error occured.
				if (mishnaYomi === 'Mishna not in chapter') {
					// The mishna is not in the chapter.
					// Increase the perek and mishna, and try again.
					mishnaTracker.perek++;
					mishnaTracker.mishna = 1;
				} else if (mishnaYomi.includes('Mishnah must be greater than 0')) {
					// The mishna is 0. Increase the mishna and try again.
					mishnaTracker.mishna++;
				} else if (mishnaYomi.includes('Chapter must be greater than 0')) {
					// The perek is 0. Increase the perek, set the mishna to 1, and try again.
					mishnaTracker.perek++;
					mishnaTracker.mishna = 1;
				} else if (mishnaYomi.includes('ends at Chapter')) {
					// The perek does not exist in this book.
					// Increase the book count, set the mishna and perek to 1
					mishnaTracker.book++;
					mishnaTracker.perek = 1;
					mishnaTracker.mishna = 1;
				}
				// save the new mishna tracker
				persistance.set('mishnaYomi', mishnaTracker);
				// and try again
				mishnaYomi = await getMishnaYomi(
					mishnaTracker.books[mishnaTracker.book],
					mishnaTracker.perek,
					mishnaTracker.mishna
				);
			}

			// update the mishna tracker
			mishnaTracker.mishna++;
			persistance.set('mishnaYomi', mishnaTracker);

			// Prepare the mishnah for sending
			mishnayot.push(mishnaYomi as MishnaYomi);
		}
		// Make sure it's not Shabbat.
		if (new Date().getDay() === 6) return;
		// Make sure the bot is in the correct state before sending the message.
		if ((await client.getState()) != WAState.CONNECTED) return;

		// get the chat object
		let chat = await client.getChatById(chats.MISHNA_YOMI_CHAT_ID);

		// Send both mishnayot
		for (let mishnaYomi of mishnayot) {
			let text = `*This Mishna Yomi message is powered by Sefaria.org*\n\n_${mishnaYomi.hebrewName}_\n${mishnaYomi.hebrew}\n\n_${mishnaYomi.englishName}_\n${mishnaYomi.english}`;
			// await chat.sendMessage(text);
			console.log(text);
		}
		console.log('[Mishna Yomi] Sent Mishna Yomi successfully');
	},
};

module.exports = task;
