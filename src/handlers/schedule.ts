import { Client } from 'whatsapp-web.js';
import { readdirSync } from 'fs';
import { CronJob } from 'cron';

module.exports = (client: Client): void => {
	// Get all js files in the folder. These files are the event handlers.
	const eventFiles = readdirSync(`./schedule`).filter((file) => file.endsWith('.js'));
	for (const file of eventFiles) {
		// Load the event handler.
		const task = require(`../schedule/${file}`);
		if (task.enabled) {
			// Create a new cron job
			let timeString = `${task.seconds} ${task.minutes} ${task.hours} ${task.dayMonth} ${task.month} ${task.dayWeek}`;
			new CronJob(timeString, task.execute.bind(null, client), null, true, 'Asia/Jerusalem');
		}
	}
};
