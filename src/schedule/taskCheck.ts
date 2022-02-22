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
		PersistantStorage.shared.getTasks().forEach(async (task) => {
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
				PersistantStorage.shared.removeTaskByID(task.taskID);
				console.log('Task completed: ' + task.action + ' on ' + task.chatID);
			}
		});
	},
};

module.exports = task;
