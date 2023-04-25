import { GroupNotification } from 'whatsapp-web.js';
import { CustomClient } from '../../types';
import { Contacts } from '../../removedInfo';

module.exports = {
    name: 'group_join',
    once: false,
    async execute(notification: GroupNotification, client: CustomClient) {
        if (notification.chatId !== Contacts.HOMEWORK_REMINDER_CHAT_ID) return;
        // @ts-ignore
        const chat = await client.getChatById(notification.id.participant);
        chat.sendMessage(`Thank you for joining the Homework Reminder Chat.
Here is a brief overview of how this chat works:
-   This chat is *admin only*. Only I (the bot) can send messages here.

-   For the best experience, please mute this chat. You will be @mentioned when you have homework due, and this will override your mute settings.
    You will only be notified if the homework is for a class you are subscribed to, and if you have not muted the assignment.

-   You are currently not registered to receive any notifications. In order to begin using this chat, you must first register with your name. To do this, send a message in the following format:
    \`\`\`!register <Your Name>\`\`\`

-   Once you have registered, you can subscribe to classes. You will only receive notifications for classes you are subscribed to.

-   To see a list of all the classes you can subscribe to, send a message in the following format:
    \`\`\`!classes\`\`\`

-   To subscribe to a class, send a message in the following format:
    \`\`\`!subscribe <class name>\`\`\`, or \`\`\`!subscribe <class number>\`\`\`
    For example, to subscribe to the class "Linear Algebra I", you would send the following message:
    \`\`\`!subscribe Linear Algebra I\`\`\`

-   To unsubscribe from a class, send a message in the following format:    
    \`\`\`!unsubscribe <class name>\`\`\` or \`\`\`!unsubscribe <class number>\`\`\`

-   To see a list of all the classes you are subscribed to, send a message in the following format:    
    \`\`\`!list\`\`\`
    
-   To stop receiving homework reminders for a particular assignment, react to the reminder with the 🔕 emoji.

-   To start receiving homework reminders for a particular assignment, react to the reminder with the 🔔 emoji.

-   If you have any questions or want to contribute to the project, please message Benji (the other admin of the chat) directly.
`);
    },
};
