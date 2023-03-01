import { Message } from 'whatsapp-web.js';
import { AutoResponse, CustomClient } from '../types';

const AutoReply: AutoResponse = {
    name: 'lchaim',
    enabled: true,
    execute: async function (
        message: Message,
        client: CustomClient
    ): Promise<void> {
        message.react('🍾');
    },
    executeCondition: async function (message: Message): Promise<boolean> {
        // Remove all non-alphanumeric characters
        message.body = message.body.replace(/[^a-zA-Z0-9]/g, '');
        return Promise.resolve(message.body.toLowerCase().includes('lchaim'));
    },
};

function delay(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

module.exports = AutoReply;
