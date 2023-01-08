import { Client } from 'whatsapp-web.js';
import { readdirSync } from 'fs';
import { CronJob } from 'cron';
import { Task } from '../types';
import { Bot } from '../utils';

module.exports = (client: Client): void => {
	// Get all js files in the folder. These files are the event handlers.
	const eventFiles = readdirSync(`./schedule`).filter((file) => file.endsWith('.js'));
	for (const file of eventFiles) {
		// Load the event handler.
		const task: Task = require(`../schedule/${file}`);
		if (task.__esModule) throw new Error(`schedule/${file} is missing module.exports`);
		if (task.name.split(' ').length > 1)
			throw new Error(`schedule/${file} has a space in the name`);
		let savedState = Bot.shared.getFeatureState(task.name);
		if (savedState === undefined) {
			Bot.shared.setFeatureState(task.name, task.enabled, client);
		} else task.enabled = savedState;
		if (task.enabled) {
			console.log(`[Schedule] enabled ${task.name}`);
			// Create a new cron job
			let timeString = `${task.seconds} ${task.minutes} ${task.hours} ${task.dayMonth} ${task.month} ${task.dayWeek}`;
			new CronJob(timeString, generateTaskFunction(task, client), null, true, 'Asia/Jerusalem');
		} else console.log(`[Schedule] DISABLED ${task.name}`);
	}
};

function generateTaskFunction(task: Task, client: Client): () => void {
	return function () {
		if (!task.silent) console.log(`[${task.name}] Executing task`);
		try {
			task.execute(client);
		} catch (err) {
			console.error(`[Schedule] Error executing task: ${task.name}`);
			console.error(err);
		}
	};
}
