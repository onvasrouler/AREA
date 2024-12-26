const AreaModel = require("../../database/models/actionReaction.js");

module.exports = {
    data: {
        name: "commit",
        description: "get the list of commit",
        default_member_permissions: null, // No specific permissions required
    },
    async execute(interaction) {
        const AREA = await AreaModel.findOne({
            "Action.arguments.userId": interaction.user.id,
            "Action.arguments.on": "/commit"
        });
        if (AREA === null || AREA.length === 0)
            return await interaction.reply("You have no actions set up for the commit");

        if (AREA.CachedData == undefined || AREA.CachedData.items == undefined)
            return await interaction.reply("wait for the data to be fetched");

        const Datas = AREA.CachedData.items;
        if (Datas.length === 0)
            return await interaction.reply("No commit found");
        const parsedData = Datas.map(data => ({
            author: data.author.login,
            message: data.commit.message,
            reponame: data.repository.name,
        }));

        const Messages = [];

        parsedData.forEach(data => {
            Messages.push(`message: ${data.message}\nUser: ${data.author}\nRepository: ${data.reponame}\n\n`);
        });

        let finalMessage = "";
        const avatarUrl = Datas[0].author.avatar_url;
        await interaction.reply(`${AREA.Reaction.arguments.prefix} ${avatarUrl}`);

        for (const message of Messages) {
            if ((finalMessage + message).length > 1500) {
                await interaction.followUp(finalMessage);
                finalMessage = "";
            }
            finalMessage += message;
        }
        if (finalMessage.length > 0)
            await interaction.followUp(finalMessage);
        return;
    }
};