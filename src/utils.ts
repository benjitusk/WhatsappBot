import axios from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { Message, Client } from 'whatsapp-web.js';

export interface Task {
	name: string;
	enabled: any;
	seconds: any;
	minutes: any;
	hours: any;
	dayMonth: any;
	month: any;
	dayWeek: any;
	execute: (client: Client) => void;
}

export interface Command {
	enabled: boolean;
	name: string;
	aliases?: string[];
	cooldown?: number;
	execute: (message: Message, client: Client) => void;
}

export interface MishnaYomi {
	hebrewName: string;
	englishName: string;
	english: string;
	hebrew: string;
}

export class PersistantStorage {
	private data: any;
	private path: string;
	constructor() {
		this.path = '../persistantStorage.json';
		this.data = JSON.parse(readFileSync(this.path) as any);
	}

	get(key: string) {
		this.data = JSON.parse(readFileSync(this.path) as any);
		return this.data[key];
	}

	set(key: string, value: any): void {
		writeFileSync(this.path, JSON.stringify(this.data, null, 2));
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
	};
}
