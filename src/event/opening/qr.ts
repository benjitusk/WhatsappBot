import qrcode from 'qrcode-terminal';
import { CustomClient } from '../../types';

module.exports = {
    name: 'qr',
    once: false,
    async execute(qr: string, client: CustomClient) {
        console.log('[Client] Received QR code');
        qrcode.generate(qr, { small: true });
    },
};
