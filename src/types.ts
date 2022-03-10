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

export enum MishnaIndex {
	MISHNA = 'mishna',
	PEREK = 'perek',
	BOOK = 'book',
}

export interface FoodData {
	breakfast: string[];
	lunch: (string | string[])[];
	dinner: (string | string[])[];
}

export interface PersistantUserData {
	[userID: string]: {
		[chatID: string]: {
			ban?: {
				chatID: string;
				userID: string;
				banID: string;
				reason: string;
				banExpires: number;
			};
			voteKick?: {
				chatID: string;
				userID: string;
				voteKickID: string;
				initiatorID: string;
				voteExpires: number;
				votes: string[];
			};
		};
	};
}

export interface PersistantMishnaYomiData {
	books: string[];
	bookIndex: number;
	perek: number;
	mishna: number;
}

export interface MishnaYomiData {
	hebrewName: string;
	englishName: string;
	english: string;
	hebrew: string;
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

export interface PersistantData {
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
		id: string;
	}[];

	countdowns: {
		purim: number;
		pesach: number;
	};
	bannedStickerMD5s: Array<string>;

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

/*

type DayOfTheWeek =
	| 'sunday'
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday';

type DayOfTheWeekMap<T> = { [day in DayOfTheWeek]: T };

const chores: DayOfTheWeekMap<string> = {
	sunday: 'do the dishes',
	monday: 'walk the dog',
	tuesday: 'water the plants',
	wednesday: 'take out the trash',
	thursday: 'clean your room',
	friday: 'mow the lawn',
	saturday: 'relax',
};

*/
