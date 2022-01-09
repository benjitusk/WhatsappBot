import qrcode from 'qrcode-terminal';
import { Client } from 'whatsapp-web.js';

module.exports = {
	name: 'qr',
	once: true,
	async execute(qr: string, client: Client) {
		console.log('[Client] Received QR code');
		qrcode.generate(qr, { small: true });
	},
};
