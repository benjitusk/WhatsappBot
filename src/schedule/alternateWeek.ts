import { Task } from '../types';
import { PersistantStorage } from '../utils';

const task: Task = {
	name: 'alternateWeek',
	enabled: true,
	seconds: '0',
	minutes: '0',
	hours: '0',
	dayMonth: '*',
	month: '*',
	dayWeek: '6',
	execute: function (): void {
		const persistance = new PersistantStorage();
		let storage = persistance.get();
		// Toggle alternate week between 0 and 1
		storage.alternateWeek = storage.alternateWeek === 0 ? 1 : 0;
		persistance.set(storage);
	},
};

module.exports = task;
