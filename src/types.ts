import { Client, Message } from 'whatsapp-web.js';

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
	name: string;
	enabled: boolean;
	admin: boolean;
	aliases: string[];
	cooldown: number;
	execute: (message: Message, client: Client) => void;
}

export interface MishnaYomi {
	hebrewName: string;
	englishName: string;
	english: string;
	hebrew: string;
}

export interface PersistantData {
	food: {
		alternateWeek: number;
		breakfast: {
			[key: string]: string;
		};
		lunch: {
			[key: string]: string | string[];
		};
		dinner: {
			[key: string]: string | string[];
		};
	};

	days: string[];

	daysToPurim: number;

	mishnaYomi: {
		bookIndex: number;
		perek: number;
		mishna: number;
		books: string[];
	};
}
