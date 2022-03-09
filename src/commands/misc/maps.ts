import { Client, LatLng, TransitMode, TravelMode } from '@googlemaps/google-maps-services-js';
import prettyMilliseconds from 'pretty-ms';
import { Message } from 'whatsapp-web.js';
import { Client as WWJSClient } from 'whatsapp-web.js';
import { Command } from '../../types';
import { APIKeys, LocationData } from '../../removedInfo';
const gClient = new Client({});
const command: Command = {
	name: 'bus',
	helpText: 'Get the next scheduled arrival time for the specified bus',
	syntax: '!bus <6 | 21 | 39>',
	enabled: true,
	admin: false,
	aliases: [],
	cooldown: 60 * 30, // 30 minutes
	execute: async function (message: Message, client: WWJSClient, args: string[]): Promise<void> {
		if (args.length < 2) {
			message.reply('Please specify a bus number.');
			return;
		}
		const busString = args[1];
		// ensure bus number is a number
		if (isNaN(parseInt(busString))) {
			message.reply('Please specify a valid bus number.');
			return;
		}
		const busNumber = parseInt(busString);

		let originLocation: LatLng = '';
		let destinationLocation: LatLng = '';

		switch (busNumber) {
			case 21:
				originLocation = LocationData.home;
				destinationLocation = LocationData.bus21;
				break;
			case 6:
			case 39:
			default:
				message.reply("Hmm... Either this bus doesn't exist or it has yet to be implemented.");
				return;
		}

		const busRoute = await gClient.directions({
			params: {
				origin: originLocation,
				destination: destinationLocation,
				mode: TravelMode.transit,
				key: APIKeys.gMaps,
				transit_mode: [TransitMode.bus],
			},
		});
		const busRouteData = busRoute.data;
		const busRouteRoutes = busRouteData.routes[0].legs[0];
		if (!busRouteRoutes.steps[1]) {
			message.reply('No transit data available');
			return;
		}
		const busRouteTransitInfo = busRouteRoutes.steps[1].transit_details;
		const departureData = busRouteTransitInfo.departure_time;
		message.reply(
			`The next scheduled arrival time for the ${busNumber} bus is in ${prettyMilliseconds(
				departureData.value * 1000 - Date.now(),
				{
					secondsDecimalDigits: 0,
				}
			)}, arriving at ${departureData.text}.`
		);
	},
};

module.exports = command;
