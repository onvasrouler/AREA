const AreaModel = require("../../database/models/actionReaction.js");

module.exports = {
    data: {
        name: "issues",
        description: "get the list of issues",
        default_member_permissions: null, // No specific permissions required
    },
    async execute(interaction) {
        const AREA = await AreaModel.findOne({
            "Action.arguments.userId": interaction.user.id,
            "Action.arguments.on": "/issues"
        });
        if (AREA === null || AREA.length === 0)
            return await interaction.reply("You have no actions set up for the issues");

        if (AREA.CachedData == undefined || AREA.CachedData.items == undefined)
            return await interaction.reply("wait for the data to be fetched");

        const Datas = AREA.CachedData.items;
        if (Datas.length === 0)
            return await interaction.reply("No issues found");
        const parsedData = Datas.map(data => ({
            title: data.title,
            state: data.state,
            user: data.user.login,

        }));

        const Messages = [];

        parsedData.forEach(data => {
            Messages.push(`Title: ${data.title}\nState: ${data.state}\nUser ${data.user}\n\n`);
        });

        let finalMessage = "";
        const avatarUrl = Datas[0].user.avatar_url;
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