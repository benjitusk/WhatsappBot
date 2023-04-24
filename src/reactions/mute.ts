import { Reaction } from 'whatsapp-web.js';
import {
    Assignment,
    CustomClient,
    HomeworkDatabase,
    ReactionHandler,
} from '../types';
import fs from 'fs';
import { getRelativePath } from '../utils';
const HOMEWORK_DB_PATH = getRelativePath('../persistant/homework.json');
const HomeworkDatabase = require(HOMEWORK_DB_PATH) as HomeworkDatabase;
const handler: ReactionHandler = {
    emoji: '🔕',
    async execute(reaction: Reaction, client: CustomClient) {
        console.log(reaction);
        // @ts-expect-error
        const userID = reaction.id.participant;

        // Get the homework being reacted to
        let homework: Assignment | undefined;
        let homeworkID: string | undefined;
        for (let [ID, assignment] of Object.entries(
            HomeworkDatabase.assignments
        )) {
            if (assignment.messageIDs.includes(reaction.msgId._serialized)) {
                homework = assignment;
                homeworkID = ID;
                break;
            }
        }
        if (!homework || !homeworkID) return;
        if (homework.mutedBy.includes(userID)) return;
        homework.mutedBy.push(userID);
        HomeworkDatabase.assignments[homeworkID] = homework;
        fs.writeFileSync(
            HOMEWORK_DB_PATH,
            JSON.stringify(HomeworkDatabase, null, 4)
        );
    },
};

module.exports = handler;
