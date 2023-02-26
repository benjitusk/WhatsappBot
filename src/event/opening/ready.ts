import { CustomClient } from '../../types';

module.exports = {
    name: 'ready',
    once: false,
    async execute(client: CustomClient) {
        console.log('[Client] Ready');
        // client.setStatus(`Last updated ${new Date().toLocaleString()}`);
    },
};
