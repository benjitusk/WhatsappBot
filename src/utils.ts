import axios from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { MishnaYomi, PersistantData } from './types';

export class PersistantStorage {
	private data: any;
	private path: string;
	constructor() {
		this.path = '../persistantStorage.json';
	}

	get() {
		return JSON.parse(readFileSync(this.path) as any) as PersistantData;
	}

	set(data: PersistantData): void {
		writeFileSync(this.path, JSON.stringify(data, null, 2));
	}

	load(): void {
		this.data = JSON.parse(readFileSync(this.path) as any);
	}

	save(): void {
		writeFileSync(this.path, JSON.stringify(this.data, null, 2));
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

export function getMeal(meal: string, threshhold: number = 0): string {
	let tomorrow = threshhold < new Date().getTime();
	let persistantStorage = new PersistantStorage();
	let storage = persistantStorage.get();

	// Check if we are in an alternate week.
	let weekNumber = storage.alternateWeek as number;

	// Get the day of the week as a number.
	let dayOfWeekIndex = new Date().getDay();

	if (tomorrow) dayOfWeekIndex++;

	let dayOfWeek = storage.days[dayOfWeekIndex] as string;
	// Get the food for the day.
	let meals = storage.food[meal] as { [key: string]: string | string[] };
	let food = meals[dayOfWeek];

	// check if food is an array.
	if (Array.isArray(food)) food = food[weekNumber];

	// capitalize the first letter of the meal
	let mealCap = meal.charAt(0).toUpperCase() + meal.slice(1);

	// return the food.
	return `${mealCap} for to${tomorrow ? 'morrow' : 'day'} is ${food}.`;
}
