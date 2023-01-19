import { CustomClient } from '../../types';
module.exports = {
    name: 'authenticated',
    once: false,
    async execute(client: CustomClient) {
        // let sessionString = JSON.stringify(session);
        // writeFile('../sessions/bot.json', sessionString, (err) => {
        // 	if (err) console.error(err);
        // });
        console.log('[Client] Authenticated');
    },
};
