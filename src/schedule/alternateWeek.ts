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
		let storage = new PersistantStorage().get();
		// Toggle alternate week
		storage.alternateWeek = storage.alternateWeek === 0 ? 1 : 0;
	},
};

module.exports = task;
