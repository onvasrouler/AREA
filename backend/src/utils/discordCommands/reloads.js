module.exports = {
    data: {
        name: 'reload',
        description: 'Reloads commands and events',
        default_permission: true

    },
    async execute(interaction) {
        const fs = require('fs');
        const path = require('path');

        const commandsPath = path.join(__dirname, '../discordCommands');
        const eventsPath = path.join(__dirname, '../discordEvents');

        for (const file of fs.readdirSync(commandsPath)) {
            delete require.cache[require.resolve(path.join(commandsPath, file))];
        }
        for (const file of fs.readdirSync(eventsPath)) {
            delete require.cache[require.resolve(path.join(eventsPath, file))];
        }

        interaction.reply('Commands and events have been reloaded.');
    }
};