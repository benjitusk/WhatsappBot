import { PersistantStorage } from '../utils';
import { Task } from '../types';

const task: Task = {
	name: 'DTP Countdown',
	enabled: true,
	seconds: '0',
	minutes: '0',
	hours: '18',
	dayMonth: '*',
	month: '*',
	dayWeek: '*',
	execute: async function () {
		const persistantStorage = new PersistantStorage();
		let storage = persistantStorage.get();
		storage.daysToPurim--;
		persistantStorage.set(storage);
	},
};

module.exports = task;
