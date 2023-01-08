import axios from 'axios';
import prettyMilliseconds from 'pretty-ms';
import { Location, Message } from 'whatsapp-web.js';
import { Client } from 'whatsapp-web.js';
import { Command } from '../../types';
const command: Command = {
    name: 'bus',
    helpText: 'Get the next scheduled arrival time for the specified bus',
    syntax: '!bus <6 | 21 | 39>',
    enabled: true,
    admin: false,
    aliases: ['bus'],
    cooldown: 0, // 0 minutes
    execute: async function (
        message: Message,
        client: Client,
        args: string[]
    ): Promise<void> {
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
        let stopID: string;
        switch (busNumber) {
            case 21:
                stopID = '2747';
                break;
            case 6:
                stopID = '954';
                break;
            case 39:
                stopID = '9895';
                break;
            default:
                message.reply('This bus route is not yet configured.');
                return;
        }

        const response = await axios.get(`https://curlbus.app/${stopID}`);
        const data = response.data;
        const filteredStops = data.visits[stopID].filter((stop: any) => {
            return new RegExp(`\\b(${busNumber})א?`).test(stop.line_name);
        });
        const upcomingStops = filteredStops.filter((stop: any) => {
            return new Date(stop.departed).getTime() > Date.now();
        });
        const uniqueStops = uniqueByKey(upcomingStops, 'trip_id');

        let reply = `_${data.stop_info.name.HE}_\n\n`;
        if (uniqueStops.length === 0) {
            reply += 'There are no upcoming arrivals.';
        } else {
            if (uniqueStops[0].location) {
                let busLocation = new Location(
                    uniqueStops[0].location.lat,
                    uniqueStops[0].location.lon
                );
                message.reply(busLocation);
            }
            for (const stop of uniqueStops) {
                const time = new Date(stop.departed);
                const prettyTime = prettyMilliseconds(
                    time.getTime() - Date.now(),
                    { compact: true }
                );
                reply += `${prettyTime} - ${time.toLocaleTimeString([], {
                    timeStyle: 'short',
                })}\n`;
            }
            // reply += `The sent location represents the approximate location of the nearest ${busNumber} bus.`;
        }
        message.reply(reply);
    },
};

module.exports = command;

function uniqueByKey(array: any[], key: string) {
    return [...new Map(array.map((x) => [x[key], x])).values()];
}
