import { Message } from 'whatsapp-web.js';
import { AutoResponse, CustomClient } from '../types';

const AutoReply: AutoResponse = {
    name: 'ArielPregMan',
    enabled: true,
    execute: async function (
        message: Message,
        client: CustomClient
    ): Promise<void> {
        let pregnantMen = ['🫃', '🫃🏻', '🫃🏼', '🫃🏽', '🫃🏾', '🫃🏿'];
        let pregManIndex = Math.floor(Math.random() * pregnantMen.length);
        let pregMan = pregnantMen[pregManIndex];
        message.react(pregMan);
    },
    executeCondition: async function (message: Message): Promise<boolean> {
        return Promise.resolve(false);
        // if (message.author == Contacts.ARIEL_BLUMSTEIN) {
        // 	await delay(Math.random() * 4000 + 3000); // between 3k and 7k ms
        // 	return Promise.resolve(true);
        // } else return Promise.resolve(false);
    },
};

function delay(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

module.exports = AutoReply;
