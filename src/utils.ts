import fs from 'fs';
import axios from 'axios';
import crypto from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { Contact, GroupChat, MessageMedia } from 'whatsapp-web.js';
import {
	Meal,
	PersistantData,
	PersistantUserData,
	PersistantMishnaYomiData,
	MishnaYomiData,
	MishnaIndex,
	FoodData,
} from './types';

export class PersistantStorage {
	private data: PersistantData;
	private path: string;

	static shared = new PersistantStorage();

	private constructor() {
		this.path = '../persistantStorage.json';
		this.data = this.get();
	}

	private get() {
		this.data = JSON.parse(readFileSync(this.path) as any) as PersistantData;
		return this.data;
	}

	private set(data: PersistantData): void {
		this.data = data;
		writeFileSync(this.path, JSON.stringify(this.data, null, 2));
	}

	load() {
		this.get();
	}

	dump() {
		return this.data;
	}

	getCountdowns() {
		return this.data.countdowns;
	}

	banSticker(sticker: MessageMedia): void {
		const stickerBase64 = sticker.data;
		const stickerMD5 = md5(stickerBase64);
		this.data.bannedStickerMD5s.push(stickerMD5);
		this.set(this.data);
	}

	isStickerBanned(sticker: MessageMedia): boolean {
		const stickerBase64 = sticker.data;
		const stickerMD5 = md5(stickerBase64);
		return this.data.bannedStickerMD5s.includes(stickerMD5);
	}

	unbanSticker(sticker: MessageMedia): void {
		const stickerBase64 = sticker.data;
		const bannedStickerMD5 = md5(stickerBase64);
		if (!this.data.bannedStickerMD5s) this.data.bannedStickerMD5s = [];
		this.data.bannedStickerMD5s = this.data.bannedStickerMD5s.filter(
			(stickerMD5) => stickerMD5 != bannedStickerMD5
		);
		this.set(this.data);
	}

	addQuote(quote: string, author: string, id?: string): void {
		this.data.quotes.push({
			content: quote,
			author: author,
			id: id || crypto.randomUUID(),
		});
	}

	getTopQuote(): { content: string; author: string; id: string } | undefined {
		return this.data.quotes[0];
	}

	removeQuoteByID(id: string): void {
		this.data.quotes = this.data.quotes.filter((quote) => quote.id != id);
		this.set(this.data);
	}

	getFoodByMealAndDay(meal: Meal, dayIndex: number): string | string[] {
		const dayOfWeek = this.data.days[dayIndex];
		const nextFood = this.data.food[meal][dayOfWeek];
		return nextFood;
	}

	getDataForNextMishna() {
		return {
			book: this.data.mishnaYomi.books[this.data.mishnaYomi.bookIndex],
			perek: this.data.mishnaYomi.perek,
			mishna: this.data.mishnaYomi.mishna,
		};
	}
	incrementMishnaYomiMishna(index: string) {
		switch (index) {
			case 'mishna':
				this.data.mishnaYomi.mishna++;
				break;
			case 'perek':
				this.data.mishnaYomi.perek++;
				this.data.mishnaYomi.mishna = 1;
				break;
			case 'book':
				this.data.mishnaYomi.perek = 1;
				this.data.mishnaYomi.mishna = 1;
				this.data.mishnaYomi.bookIndex++;
				break;
			default:
				throw new Error('Invalid MishnaYomi index');
		}
		this.set(this.data);
	}
}

export class FoodManager {
	private data: FoodData;
	private path: string;

	private constructor() {
		this.path = '../persistant/userInfo.json';
		// Create the file if it doesn't exist
		if (!fs.existsSync(this.path)) {
			throw 'Food Data is missing.';
		}
		this.data = JSON.parse(readFileSync(this.path) as any) as FoodData;
	}
}

export class Users {
	private data: PersistantUserData;
	private path: string;

	private constructor() {
		this.path = '../persistant/userInfo.json';
		// Create the file if it doesn't exist
		if (!fs.existsSync(this.path)) {
			this.data = {};
			this.set(this.data);
		}
		this.data = JSON.parse(readFileSync(this.path) as any) as PersistantUserData;
	}
	private set(data: PersistantUserData): void {
		this.data = data;
		writeFileSync(this.path, JSON.stringify(this.data, null, 2));
	}

	createUserIfNotExists(userID: string): void {
		if (!this.data[userID]) this.data[userID] = { bans: {} };
		this.set(this.data);
	}

	banUserFromChat(user: Contact, chat: GroupChat, duration: number, reason?: string): void {
		if (!this.userIsBannedFromChat(user.id._serialized, chat.id._serialized))
			chat.removeParticipants([user.id._serialized]);
		this.saveBan(user.id._serialized, chat.id._serialized, Date.now() + duration, reason);
	}

	/**
	 * Save a ban to the user's data
	 * If the user is already banned, the ban will be updated.
	 * If the ban time is -1, the ban will never expire.
	 *
	 * @param {string} userID
	 * @param {string} chatID
	 * @param {number} banExpires
	 * @param {string} reason
	 * @memberof Users
	 */
	saveBan(userID: string, chatID: string, banExpires: number, reason?: string): void {
		this.createUserIfNotExists(userID);
		this.data[userID].bans[chatID] = {
			banID: crypto.randomUUID(),
			reason: reason || '',
			banExpires,
			chatID,
			userID,
		};
		this.set(this.data);
	}

	/**
	 * Returns all bans for all chats for all users
	 */
	getAllBans(): {
		chatID: string;
		banID: string;
		reason: string;
		banExpires: number;
		userID: string;
	}[] {
		let bans = [];
		for (const userID in this.data)
			for (const chatID in this.data[userID].bans) bans.push(this.data[userID].bans[chatID]);

		return bans;
	}

	unsetBanByID(banID: string): void {
		for (const userID in this.data)
			for (const chatID in this.data[userID].bans)
				if (this.data[userID].bans[chatID].banID == banID) {
					delete this.data[userID].bans[chatID];
					return;
				}

		this.set(this.data);
	}

	userIsBannedFromChat(userID: string, chatID: string): boolean {
		this.createUserIfNotExists(userID);
		return this.data[userID].bans[chatID] != undefined;
	}

	static shared = new Users();
}

export class MishnaYomi {
	private data: PersistantMishnaYomiData;
	private path: string;

	private constructor() {
		this.path = '../persistant/mishnaYomi.json';
		// Create the file if it doesn't exist
		if (!fs.existsSync(this.path)) {
			throw new Error('MishnaYomi file does not exist. Exiting.');
		}
		this.data = JSON.parse(readFileSync(this.path) as any) as PersistantMishnaYomiData;
	}
	private set(data: PersistantMishnaYomiData): void {
		this.data = data;
		writeFileSync(this.path, JSON.stringify(this.data, null, 2));
	}

	getDataForNextMishna(): { book: string; perek: number; mishna: number } {
		return {
			book: this.data.books[this.data.bookIndex],
			perek: this.data.perek,
			mishna: this.data.mishna,
		};
	}

	async getNextMishnaAt(requestedMishna: {
		book: string;
		perek: number;
		mishna: number;
	}): Promise<MishnaYomiData | null> {
		let mishnaData = await this.getSpecificMishna(requestedMishna);
		// Check for errors
		let retryCount = 0;
		while (typeof mishnaData === 'string') {
			retryCount++;
			if (retryCount > 5) {
				console.error(`[Mishna Yomi] Couldn't get mishnaYomi: ${mishnaData}`);
				return null;
			}
			if (mishnaData === 'Mishna not in chapter') {
				// The mishna is not in the chapter.
				// Increase the perek and try again.
				this.incrementMishnaYomiIndex(MishnaIndex.PEREK);
			} else if (mishnaData.includes('Mishnah must be greater than 0')) {
				// The mishna is 0... Somehow... Increase the mishna and try again.
				this.incrementMishnaYomiIndex(MishnaIndex.MISHNA);
			} else if (mishnaData.includes('Chapter must be greater than 0')) {
				// The perek is 0. Increase the perek, set the mishna to 1, and try again.
				this.incrementMishnaYomiIndex(MishnaIndex.PEREK);
			} else if (mishnaData.includes('ends at Chapter')) {
				// The perek does not exist in this book.
				// Increase the book count, set the mishna and perek to 1
				this.incrementMishnaYomiIndex(MishnaIndex.BOOK);
			}
			mishnaData = await this.getSpecificMishna(this.getDataForNextMishna());
		}

		return mishnaData;
	}

	async getSpecificMishna(requestedMishna: {
		book: string;
		perek: number;
		mishna: number;
	}): Promise<MishnaYomiData | string> {
		let { book, perek, mishna } = requestedMishna;
		if (book != 'Pirkei Avot') book = 'Mishnah_' + book;
		let response = await axios.get(
			`https://www.sefaria.org/api/texts/${book}.${perek}.${mishna}?context=0`
		);
		let data = response.data;
		if (data.error) return data.error as string;
		if (data.text === '') return 'Mishna not in chapter';

		let englishMishna = data.text
			.replaceAll('&lt;', '<') // replace XSS safe angle brackets with normal ones
			.replaceAll('&gt;', '>')
			.replaceAll('<b>', '*') // Replace bold tags with *
			.replaceAll('</b>', '*')
			.replaceAll('<i>', '_') // Replace italic tags with _
			.replaceAll('</i>', '_')
			.replaceAll(/(<([^>]+)>)/gi, ''); // Remove all leftover tags
		let hebrewMishna = data.he.replaceAll(/(<([^>]+)>)/gi, ''); // Remove all HTML tags
		return {
			hebrewName: data.heRef,
			englishName: data.ref,
			english: englishMishna,
			hebrew: hebrewMishna,
		};
	}

	async fetchNextMishna(): Promise<MishnaYomiData | null> {
		return await this.getNextMishnaAt(this.getDataForNextMishna());
	}

	incrementMishnaYomiIndex(index: MishnaIndex) {
		switch (index) {
			case 'mishna':
				this.data.mishna++;
				break;
			case 'perek':
				this.data.perek++;
				this.data.mishna = 1;
				break;
			case 'book':
				this.data.perek = 1;
				this.data.mishna = 1;
				this.data.bookIndex++;
				break;
			default:
				throw new Error('Invalid MishnaYomi index');
		}
		this.set(this.data);
	}

	static shared = new MishnaYomi();
}

// export async function getMishnaYomi(
// 	book: string,
// 	perek: number,
// 	mishna: number
// ): Promise<MishnaYomiData | string> {

// 	// Increase the mishna count
// 	mishna++;
// 	// Save changes to file

// 	// Return the mishna

// }

/**
 * Retrieve the next food from the database based on the given date
 *
 * @param timestamp The timestamp to retreive the food for, in milliseconds
 */
export function getNextFoodFromDateByMeal(meal: Meal, date: Date): string {
	// convert the timestamp from seconds to milliseconds if it is not already
	// let storage = PersistantStorage.shared.get();

	// Get the day of the week
	let dayIndex = date.getDay();

	// If the request is for after the meal ended, get the meal for tomorrow
	if (shouldGetMealForTomorrow(meal, date)) dayIndex++;

	dayIndex %= 7; // Make sure the day index is between 0 and 6

	const alternateWeek = getWeekNumber(date) % 2;

	let food = PersistantStorage.shared.getFoodByMealAndDay(meal, dayIndex);
	food = Array.isArray(food) ? food[alternateWeek] : food;

	return food;
}

export function md5(str: string): string {
	return crypto.createHash('md5').update(str).digest('hex');
}

function getWeekNumber(date: Date): number {
	// Get the first day of the year
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	// Get the day of the week
	const dayOfYear = Math.ceil((date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24));
	// Get the week number
	return Math.ceil(dayOfYear / 7);
}

function shouldGetMealForTomorrow(meal: Meal, date: Date): boolean {
	const hour = date.getHours();
	const minute = date.getMinutes();
	return (
		((hour > 9 || (hour == 9 && minute > 30)) && meal == Meal.BREAKFAST) ||
		((hour > 13 || (hour == 13 && minute > 30)) && meal == Meal.LUNCH) ||
		((hour > 19 || (hour == 19 && minute > 45)) && meal == Meal.DINNER)
	);
}
