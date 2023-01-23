import prettyMilliseconds from 'pretty-ms';
import { Contacts } from '../removedInfo';
import { CustomClient, Task } from '../types';

const task: Task = {
    name: 'finalsReminder',
    enabled: false,
    seconds: '0',
    minutes: '0',
    hours: '9-20',
    dayMonth: '*',
    month: '*',
    dayWeek: '*',
    silent: false,
    execute: async function (client: CustomClient) {
        // Make sure it's not Shabbos (between Friday night and Saturday night)
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        if (day === 5 && hour >= 16) return;
        if (day === 6 && hour < 18) return;
        // This function will run hourly, and it will send a message to Eyal Schachter
        // at 3 random intervals during the hour.
        // The message will contain the exact time until his next final.
        const eyal = await client.getContactById(Contacts.EYAL_SCHACHTER);
        const chat = await eyal.getChat();
        const messageCount = 3;
        const randomTimes = [];
        const EYALS_FIRST_FINAL = new Date('2023-01-26T07:00:00.000Z');
        for (let i = 0; i < messageCount; i++) {
            randomTimes.push(Math.floor(Math.random() * 60));
        }
        for (let time of randomTimes) {
            setTimeout(async () => {
                let timeToFinal = prettyMilliseconds(
                    EYALS_FIRST_FINAL.getTime() - Date.now(),
                    {
                        secondsDecimalDigits: 3,
                        verbose: true,
                    }
                );
                await chat.sendMessage(
                    `*משרד המשמעת*\n\nYou are in danger of missing your _Calculus I_ final, in ${timeToFinal}!.`
                );
            }, time * 60 * 1000);
        }
    },
};

module.exports = task;
