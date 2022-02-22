import axios from 'axios';
import crypto from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { MessageMedia } from 'whatsapp-web.js';
import { Meal, MishnaYomi, PersistantData, TaskActions } from './types';

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

	/**
	 * @breif Add a new task to be executed later
	 *
	 * @param {TaskActions} action
	 * @param {string} userID
	 * @param {string} chatID
	 * @param {number} dueDate
	 * @memberof PersistantStorage
	 */
	addTask(
		action: TaskActions,
		userID: string,
		chatID: string,
		dueDate: number
	): void {
		this.data.tasks.push({
			action,
			userID,
			chatID,
			dueDate,
			taskID: crypto.randomUUID(),
		});
		this.set(this.data);
	}

	getTasks() {
		return this.data.tasks;
	}

	removeTaskByID(taskID: string): void {
		this.data.tasks = this.data.tasks.filter((task) => task.taskID != taskID);
		this.set(this.data);
	}

	deleteTestTasks(): void {
		this.data.tasks = this.data.tasks.filter((task) => task.action != 'test');
		this.set(this.data);
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

export async function getMishnaYomi(
	book: string,
	perek: number,
	mishna: number
): Promise<MishnaYomi | string> {
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

	// Increase the mishna count
	mishna++;
	// Save changes to file

	// Return the mishna
	return {
		hebrewName: data.heRef,
		englishName: data.ref,
		english: englishMishna,
		hebrew: hebrewMishna,
	};
}

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

	const alternateWeek = 1 - (getWeekNumber(date) % 2); // If it's 0, set it to be 1, if it's 1, set it to be 0

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
	const dayOfYear = Math.ceil(
		(date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24)
	);
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
