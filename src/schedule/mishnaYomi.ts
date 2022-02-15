import { Client, WAState } from 'whatsapp-web.js';
import { getMishnaYomi, PersistantStorage } from '../utils';
import { chats } from '../removedInfo';
import { MishnaYomi, Task } from '../types';

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
		let persistance = new PersistantStorage();
		let storage = persistance.get();
		let mishnayot: MishnaYomi[] = [];

		// Get 2 mishnayot
		for (let i = 0; i < 2; i++) {
			// Get the mishna
			let mishnaYomi = await getMishnaYomi(
				storage.mishnaYomi.books[storage.mishnaYomi.bookIndex],
				storage.mishnaYomi.perek,
				storage.mishnaYomi.mishna
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
					storage.mishnaYomi.perek++;
					storage.mishnaYomi.mishna = 1;
				} else if (mishnaYomi.includes('Mishnah must be greater than 0')) {
					// The mishna is 0. Increase the mishna and try again.
					storage.mishnaYomi.mishna++;
				} else if (mishnaYomi.includes('Chapter must be greater than 0')) {
					// The perek is 0. Increase the perek, set the mishna to 1, and try again.
					storage.mishnaYomi.perek++;
					storage.mishnaYomi.mishna = 1;
				} else if (mishnaYomi.includes('ends at Chapter')) {
					// The perek does not exist in this book.
					// Increase the book count, set the mishna and perek to 1
					storage.mishnaYomi.bookIndex++;
					storage.mishnaYomi.perek = 1;
					storage.mishnaYomi.mishna = 1;
				}
				// save the new mishna tracker
				persistance.set(storage);
				// and try again
				mishnaYomi = await getMishnaYomi(
					storage.mishnaYomi.books[storage.mishnaYomi.bookIndex],
					storage.mishnaYomi.perek,
					storage.mishnaYomi.mishna
				);
			}

			// update the mishna tracker
			storage.mishnaYomi.mishna++;
			persistance.set(storage);

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
			await chat.sendMessage(text, { linkPreview: false });
		}
		console.log('[Mishna Yomi] Sent Mishna Yomi successfully');
	},
};

module.exports = task;
