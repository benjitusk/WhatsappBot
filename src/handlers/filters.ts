import { readdirSync } from 'fs';
import { CustomClient, Filter } from '../types';
import { Bot } from '../utils';

module.exports = (client: CustomClient): void => {
    // Get all js files in the folder. These files are the filter controls.
    const filterFiles = readdirSync(`./filters`).filter((file) =>
        file.endsWith('.js')
    );
    for (const file of filterFiles) {
        // Load the filter control.
        const filter: Filter = require(`../filters/${file}`);
        if (filter.__esModule)
            throw new Error(`filters/${file} is missing module.exports`);
        if (filter.name.split(' ').length > 1)
            throw new Error(`filters/${file} has a space in the name`);
        client.filters.set(filter.name.toLowerCase(), filter);
        let savedState = Bot.shared.getFeatureState(filter.name);
        if (savedState === undefined) {
            Bot.shared.setFeatureState(filter.name, filter.enabled, client);
        } else filter.enabled = savedState;
        if (filter.enabled) {
            console.log(`[Filter] enabled ${filter.name}`);
        } else console.log(`[Filter] DISABLED ${filter.name}`);
    }
};
