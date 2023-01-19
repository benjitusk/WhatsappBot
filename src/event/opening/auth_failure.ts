import { CustomClient } from '../../types';

module.exports = {
    name: 'auth_failure',
    once: false,
    async execute(error: any, client: CustomClient) {
        console.log('[Client] Authentication failed');
        console.log(error);
    },
};
