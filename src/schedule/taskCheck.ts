import { Client, GroupChat } from 'whatsapp-web.js';
import { Task } from '../types';
import { PersistantStorage } from '../utils';

const task: Task = {
	name: 'TaskCheck',
	enabled: true,
	// Every 30 seconds
	seconds: '*/30',
	minutes: '*',
	hours: '*',
	dayMonth: '*',
	month: '*',
	dayWeek: '*',
	silent: true,
	execute: async function (client: Client): Promise<void> {
		const now = new Date().getTime();
		const persistance = new PersistantStorage();
		let didModifyStorage = false;
		let storage = persistance.get();
		// Check for tasks
		for (let i = 0; i < storage.tasks.length; i++) {
			let task = storage.tasks[i];
			if (task.dueDate <= now) {
				let chat = (await client.getChatById(task.chatID)) as GroupChat;
				switch (task.action) {
					case 'addUser':
						chat.addParticipants([task.userID]);
						break;
					case 'unmuteChat':
						chat.setMessagesAdminsOnly(false);
						break;
				}
				storage.tasks.splice(storage.tasks.indexOf(task), 1);
				didModifyStorage = true;
			}
		}
		if (didModifyStorage) persistance.set(storage);
	},
};

module.exports = task;
