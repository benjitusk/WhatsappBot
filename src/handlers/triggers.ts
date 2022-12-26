import Collection from '@discordjs/collection';
import { readdirSync } from 'fs';
import { Client } from 'whatsapp-web.js';
import { AutoResponse } from '../types';
import { Bot } from '../utils';

module.exports = (client: Client): void => {
	// clear existing autoResponses
	client.autoResponses = new Collection();
	const triggerFiles = readdirSync(`./triggers`).filter((file) => file.endsWith('.js'));
	for (const file of triggerFiles) {
		const autoResponse = require(`../triggers/${file}`) as AutoResponse;
		if (autoResponse.__esModule) throw new Error(`triggers/${file} is missing module.exports`);
		if (autoResponse.name.split(' ').length > 1)
			throw new Error(`triggers/${file} has a space in the name`);
		autoResponse.enabled = Bot.shared.getFeatureState(autoResponse.name);
		if (autoResponse.enabled) {
			client.autoResponses.set(autoResponse.name.toLowerCase(), autoResponse);
			console.log(`[Trigger] enabled ${autoResponse.name}.`);
		} else {
			console.log(`[Trigger] DISABLED ${autoResponse.name}.`);
		}
	}
};
