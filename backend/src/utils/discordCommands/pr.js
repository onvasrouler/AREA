const AreaModel = require("../../database/models/actionReaction.js");

module.exports = {
    data: {
        name: "pr",
        description: "get the list of pull requests",
        default_member_permissions: null, // No specific permissions required
    },
    async execute(interaction) {
        const AREA = await AreaModel.findOne({
            "Action.arguments.userId": interaction.user.id,
            "Action.arguments.on": "/pr"
        });
        if (!AREA)
            return await interaction.reply("You have no actions set up for the command /pr");
        if (AREA.active === false)
            return await interaction.reply("The action is not active");
        if (AREA.CachedData == "error")
            return await interaction.reply("An error occured: **" + AREA.Errors.message + "** for the area with the name : **" + AREA.Name + "**");

        if (AREA.CachedData == undefined || AREA.CachedData.items == undefined)
            return await interaction.reply("wait for the data to be fetched");

        const Datas = AREA.CachedData.items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
        if (Datas.length === 0)
            return await interaction.reply("No pull requests found");
        const parsedData = Datas.map(data => {
            const date = new Date(data.created_at);
            const formattedDate = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            const PrState = data.state === "open" ? ":green_circle: open" : data.state === "closed" ? ":red_circle: closed" : ":yellow_circle: merged";
            return {
                title: data.title,
                state: PrState,
                user: data.user.login,
                date: formattedDate
            };
        });

        const Messages = [];

        parsedData.forEach(data => {
            Messages.push(`Title: **${data.title}**\nState: **${data.state}**\nAuthor: **${data.user}**\nDate: **${data.date}**\n\n`);
        });

        let finalMessage = "";
        const avatarUrl = Datas[0].user.avatar_url;
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