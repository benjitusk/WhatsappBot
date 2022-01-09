import WAWebJS from 'whatsapp-web.js';
module.exports = {
	name: 'message',
	once: false,
	/**
	 *
	 * @param {WAWebJS.Message} message The message object triggering the event.
	 * @param {WAWebJS.Client} client   The client object that received the message.
	 *
	 * @returns { Promise<void> }
	 */
	async execute(message: WAWebJS.Message, client: WAWebJS.Client): Promise<void> {
		/**
		 * Any functionality that needs to be executed
		 * when a message is received can be done here.
		 *
		 * Here are the processes that will be executed:
		 *
		 * 1. Log the message to MySQL.
		 * 2. Handle commands.
		 * 3. Handle poll responses.
		 *
		 */
	},
};
