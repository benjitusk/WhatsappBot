import axios from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { Contact, GroupChat } from 'whatsapp-web.js';
import { Meal, MishnaYomi, PersistantData, TaskActions } from './types';

export class PersistantStorage {
	private data: PersistantData;
	private path: string;
	constructor() {
		this.path = '../persistantStorage.json';
		this.data = this.get();
	}

	get() {
		this.data = JSON.parse(readFileSync(this.path) as any) as PersistantData;
		return this.data;
	}

	set(data: PersistantData): void {
		this.data = data;
		writeFileSync(this.path, JSON.stringify(this.data, null, 2));
	}

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
		});
		this.set(this.data);
	}
	deleteTestTasks(): void {
		this.data.tasks = this.data.tasks.filter((task) => task.action != 'test');
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
	const persistantStorage = new PersistantStorage();
	let storage = persistantStorage.get();

	// Get the day of the week
	let dayIndex = date.getDay();

	// If it's after 9:30AM and it's breakfast, increment the day
	if (shouldGetMealForTomorrow(meal, date)) dayIndex++;

	dayIndex %= 7; // Make sure the day index is between 0 and 6

	const alternateWeek = 1 - (getWeekNumber(date) % 2); // If it's 0, set it to be 1, if it's 1, set it to be 0

	const dayOfWeek = storage.days[dayIndex];
	const nextFood = storage.food[meal][dayOfWeek];
	const food = Array.isArray(nextFood) ? nextFood[alternateWeek] : nextFood;

	return food;
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
