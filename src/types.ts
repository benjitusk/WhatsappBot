import { Client, Message } from 'whatsapp-web.js';

export enum TaskActions {
	ADD_USER = 'addUser',
	UNMUTE_CHAT = 'unmuteChat',
	TEST = 'test',
}

export enum Meal {
	BREAKFAST = 'breakfast',
	LUNCH = 'lunch',
	DINNER = 'dinner',
}

export interface Filter {
	name: string;
	enabled: boolean;
	cooldown: number;
	timeout: number;
	tolerance: number;
	reason: string;
	test: (message: Message) => Promise<boolean>;
	__esModule?: boolean;
}

export interface Task {
	name: string;
	enabled: boolean;
	seconds: string;
	minutes: string;
	hours: string;
	dayMonth: string;
	month: string;
	dayWeek: string;
	silent: boolean;
	execute: (client: Client) => void;
}

export interface Command {
	/** The primary trigger and name of the command */
	name: string;
	/** A description of the command */
	helpText: string;
	/** Correct syntax for the command */
	syntax: string;
	/** A toggle to easily disable a command */
	enabled: boolean;
	/** A toggle to require admin permission to execute */
	admin: boolean;
	/** A list of aliases for the command */
	aliases: string[];
	/** Time to wait between executions, in seconds */
	cooldown: number;
	/** The function to execute when the command is triggered */
	execute: (message: Message, client: Client, args: string[]) => void;
	/** A variable that is true when there is no module.exports */
	__esModule?: boolean;
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
	quotes: {
		content: string;
		author: string;
	}[];
	purimTimestamp: number;
	pesachTimestamp: number;

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

	tasks: {
		action: TaskActions;
		userID: string;
		chatID: string;
		dueDate: number;
	}[];

	amiQuotes: {
		submitter: string;
		quote: string;
	}[];
}
