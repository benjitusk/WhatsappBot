import { GroupChat } from 'whatsapp-web.js';
import { Ban, CustomClient, Task } from '../types';
import { Users } from '../utils';

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
    execute: async function (client: CustomClient): Promise<void> {
        const now = new Date().getTime();
        let bansByChat = {} as { [chatID: string]: Ban[] };

        for (let ban of Users.shared.getAllBans()) {
            if (ban.banExpires <= 0) continue;
            if (ban.banExpires <= now) {
                if (bansByChat[ban.chatID] === undefined)
                    bansByChat[ban.chatID] = [] as Ban[];
                bansByChat[ban.chatID].push(ban);
                let chat = (await client.getChatById(ban.chatID)) as GroupChat;
                if (chat.isGroup) chat.addParticipants([ban.userID]);
            }
        }

        for (let chatID in bansByChat) {
            let userIDsToReAdd = [] as string[];
            let banIDsToUnset = [] as string[];
            try {
                for (let ban of bansByChat[chatID]) {
                    userIDsToReAdd.push(ban.userID);
                    banIDsToUnset.push(ban.banID);
                }
                let chat = (await client.getChatById(chatID)) as GroupChat;
                if (chat.isGroup) await chat.addParticipants(userIDsToReAdd);
                for (let banID of banIDsToUnset)
                    Users.shared.unsetBanByID(banID);
            } catch (e) {
                console.error(e);
            }
        }
    },
};

module.exports = task;
