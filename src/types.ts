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
	/** The primary trigger and name of the command */
	name: string;
	/** A toggle to easily disable a command */
	enabled: boolean;
	/** A toggle to require admin permission to execute */
	admin: boolean;
	/** A list of aliases for the command */
	aliases: string[];
	/** Time to wait between executions, in seconds */
	cooldown: number;
	execute: (message: Message, client: Client, args: string[]) => void;
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
		[meal: string]: {
			// breakfast/lunch/dinner
			[day: string]: string | string[]; // food/rotation
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

	polls: {
		[name: string]: {
			expiration: number;
			votes: {
				[votes: string]: number;
				good: number;
				meh: number;
				bad: number;
			};
			voters: string[];
		};
	};
}
