import axios from 'axios';
import { readFileSync } from 'fs';

export interface MishnaYomi {
	hebrewName: string;
	englishName: string;
	english: string;
	hebrew: string;
	next: {
		book: string;
		perek: number;
		mishna: number;
	};
}

export class PersistantStorage {
	private data: any;
	constructor() {
		this.data = JSON.parse(readFileSync('../persistantStorage.json') as any);
	}

	get(key: string) {
		return this.data[key];
	}

	set(key: string, value: any) {
		this.data[key] = value;
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
		next: {
			book,
			perek,
			mishna,
		},
	};
}
