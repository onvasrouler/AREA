const AreaModel = require('../../database/models/actionReaction.js');

module.exports = {
    data: {
        name: 'repo',
        description: 'get the list of repositories',
        default_member_permissions: null, // No specific permissions required
    },
    async execute(interaction) {
        const AREA = await AreaModel.findOne({
            'Action.arguments.userId': interaction.user.id,
            'Action.arguments.on': '/repo'
        });
        if (AREA === null || AREA.length === 0)
            return await interaction.reply('You have no actions set up for the repositories');

        if (AREA.CachedData == undefined)
            return await interaction.reply('wait for the data to be fetched');

        const Datas = AREA.CachedData;
        if (Datas.length === 0)
            return await interaction.reply('No pull requests found');
        const parsedData = Datas.map(data => ({
            name: data.name,
            owner: data.owner.login,
            description: data.description,
            ssh_url: data.ssh_url
        }));

        const Messages = [];

        parsedData.forEach(data => {
            Messages.push(`Nitle: ${data.name}\nOwner: ${data.name}\nDescription: ${data.description}\nSsh Url: ${data.ssh_url}\n\n`);
        });

        let finalMessage = '';
        await interaction.reply(`${AREA.Reaction.arguments.prefix}`);
        for (const message of Messages) {
            if ((finalMessage + message).length > 1500) {
                await interaction.followUp(finalMessage);
                finalMessage = '';
            }
            finalMessage += message;
        }
        if (finalMessage.length > 0)
            await interaction.followUp(finalMessage);
        return;
    }
};