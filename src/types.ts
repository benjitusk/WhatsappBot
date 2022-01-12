import { Client, Message } from 'whatsapp-web.js';

export interface Task {
	name: string;
	enabled: boolean;
	seconds: string;
	minutes: string;
	hours: string;
	dayMonth: string;
	month: string;
	dayWeek: string;
	execute: (client: Client) => void;
}

export interface Command {
	name: string;
	enabled: boolean;
	admin: boolean;
	aliases: string[];
	cooldown: number;
	execute: (message: Message, client: Client, args?: string[]) => void;
}

export interface MishnaYomi {
	hebrewName: string;
	englishName: string;
	english: string;
	hebrew: string;
}

export interface PersistantData {
	alternateWeek: number;
	food: {
		[key: string]: {
			// breakfast/lunch/dinner
			[key: string]: string | string[]; // food/rotation
		};
	};

	days: string[];
	quotes: [
		{
			content: string;
			author: string;
		}
	];
	daysToPurim: number;

	mishnaYomi: {
		bookIndex: number;
		perek: number;
		mishna: number;
		books: string[];
	};
}
