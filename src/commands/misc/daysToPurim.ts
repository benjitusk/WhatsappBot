import prettyMilliseconds from 'pretty-ms';
import { Message } from 'whatsapp-web.js';
import { Command, CustomClient } from '../../types';
import { PersistantStorage } from '../../utils';
import { parseMilliseconds } from '../../utils';

const command: Command = {
    name: 'daysToPurim',
    helpText: 'Get the time remaining until Purim',
    syntax: 'dtp',
    enabled: true,
    aliases: ['dtp'],
    admin: false,
    cooldown: 0,
    execute(message: Message, client: CustomClient): void {
        const persistantStorage = PersistantStorage.shared;
        const timeToPurim: number =
            persistantStorage.getCountdowns().purim - Date.now();
        const prettyTimeToPurim: string = prettyMilliseconds(timeToPurim, {
            secondsDecimalDigits: 3,
            verbose: true,
        });
        const timeToPurimParsed = parseMilliseconds(timeToPurim);
        if (timeToPurim > 0)
            if (timeToPurimParsed.hours > 500)
                message.reply(
                    `*${prettyTimeToPurim} until Purim!*\n🥂 Lchaim!`
                );
            else
                message.reply(
                    `*${
                        timeToPurimParsed.days * 24 + timeToPurimParsed.hours
                    } hours ${timeToPurimParsed.minutes} minutes ${
                        timeToPurimParsed.seconds
                    }.${
                        timeToPurimParsed.milliseconds
                    } seconds until Purim!*\n🥂 Lchaim!`
                );
        else if (timeToPurim <= 0 && timeToPurim > -86400000) {
            let timeSincePurim: number = -timeToPurim;
            const prettyTimeSincePurim: string = prettyMilliseconds(
                timeSincePurim,
                {
                    secondsDecimalDigits: 3,
                    verbose: true,
                }
            );
            message.reply(
                `It's been Purim for ${prettyTimeSincePurim}!\n🥂 Lchaim!\n\n_Please drink responsibly!_`
            );
        } else {
            // Run the DaysToPesach command
            client.commands.get('daystopesach')?.execute(message, client);
        }
    },
};

module.exports = command;
