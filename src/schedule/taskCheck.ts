import { Client, GroupChat } from 'whatsapp-web.js';
import { Task, TaskActions } from '../types';
import { PersistantStorage, Users } from '../utils';

interface ChatWithDueDate {
	[chatID: string]: {
		dueDate: number;
		taskID: string;
	};
}
interface futureTask {
	[user: string]: ChatWithDueDate;
}

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

		for (let ban of Users.shared.getAllBans()) {
			if (ban.banExpires <= 0) continue;
			if (ban.banExpires <= now) {
				let chat = (await client.getChatById(ban.chatID)) as GroupChat;
				if (chat.isGroup) chat.addParticipants([ban.userID]);
				Users.shared.unsetBanByID(ban.banID);
			}
		}
	},
};

module.exports = task;
