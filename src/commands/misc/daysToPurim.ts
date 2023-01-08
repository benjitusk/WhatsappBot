import prettyMilliseconds from 'pretty-ms';
import { Message } from 'whatsapp-web.js';
import { Command } from '../../types';
import { PersistantStorage } from '../../utils';

const command: Command = {
    name: 'daysToPurim',
    helpText: 'Get the time remaining until Purim',
    syntax: 'dtp',
    enabled: true,
    aliases: ['dtp'],
    admin: false,
    cooldown: 0,
    execute(message: Message): void {
        const persistantStorage = PersistantStorage.shared;
        const timeToPurim: number =
            persistantStorage.getCountdowns().purim - Date.now();
        const prettyTimeToPurim: string = prettyMilliseconds(timeToPurim, {
            secondsDecimalDigits: 3,
            verbose: true,
        });
        if (timeToPurim > 0)
            message.reply(`*${prettyTimeToPurim} until Purim!*\n🥂 Lchaim!`);
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
            message.reply(
                'Purim is over, but keep an eye on that !DTPesach countdown!'
            );
        }
    },
};

module.exports = command;
