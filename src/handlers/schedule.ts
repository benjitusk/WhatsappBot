import { Client } from 'whatsapp-web.js';
import { readdirSync } from 'fs';
import { CronJob } from 'cron';
import { Task } from '../utils';

module.exports = (client: Client): void => {
	// Get all js files in the folder. These files are the event handlers.
	const eventFiles = readdirSync(`./schedule`).filter((file) => file.endsWith('.js'));
	for (const file of eventFiles) {
		// Load the event handler.
		const task: Task = require(`../schedule/${file}`);
		if (task.enabled) {
			// Create a new cron job
			let timeString = `${task.seconds} ${task.minutes} ${task.hours} ${task.dayMonth} ${task.month} ${task.dayWeek}`;
			new CronJob(timeString, generateTaskFunction(task, client), null, true, 'Asia/Jerusalem');
		}
	}
};

function generateTaskFunction(task: Task, client: Client): () => void {
	return function () {
		console.log('[Schedule] Executing task: ' + task.name);
		try {
			task.execute(client);
		} catch (e) {
			console.error(`[Schedule] Error executing task: ${task.name}`);
			console.error(e);
		}
	};
}
