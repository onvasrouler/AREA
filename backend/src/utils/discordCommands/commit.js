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
        if (!AREA)
            return await interaction.reply("You have no actions set up for the command /commit");
        if (AREA.active === false)
            return await interaction.reply("The action is not active");
        if (AREA.CachedData == "error")
            return await interaction.reply("An error occured: **" + AREA.Errors.message + "** for the area with the name : **" + AREA.Name + "**");
        if (AREA.CachedData == undefined || AREA.CachedData.items == undefined)
            return await interaction.reply("wait for the data to be fetched");

        const Datas = AREA.CachedData.items.sort((a, b) => new Date(b.commit.author.date) - new Date(a.commit.author.date)).slice(0, 10);
        if (Datas.length === 0)
            return await interaction.reply("No commit found");
        const parsedData = Datas.map(data => {
            const date = new Date(data.commit.author.date);
            const formattedDate = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            return {
                author: data.author.login,
                message: data.commit.message,
                reponame: data.repository.name,
                date: formattedDate
            };
        });

        const Messages = [];

        parsedData.forEach(data => {
            Messages.push(`message: **${data.message}**\nUser: **${data.author}**\nRepository: **${data.reponame}**\nDate : **${data.date}**\n\n`);
        });

        let finalMessage = "";
        const avatarUrl = Datas[0].author.avatar_url;
        await interaction.reply(`${AREA.Reaction.arguments.message} [avatar](${avatarUrl})`);

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