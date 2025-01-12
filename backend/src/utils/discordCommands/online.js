const AreaModel = require("../../database/models/actionReaction.js");

module.exports = {
    data: {
        name: "twitchonline",
        description: "get the user's twitch following channels",
        default_member_permissions: null, // No specific permissions required
        options: [
            {
                name: "amount",
                description: "The amount of channels to display",
                type: "INTEGER",
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const AREA = await AreaModel.findOne({
            "Action.arguments.userId": interaction.user.id,
            "Action.arguments.on": "/twitchonline"
        });
        const { options } = interaction;
        const amount = options.getInteger("amount") || 10;
        if (amount <= 0 || amount > 100) {
            return await interaction.reply("The amount must be between 1 and 30");
        }
        if (AREA === null || AREA.length === 0)
            return await interaction.reply("You have no action/reaction setted up for the online channels");
        if (AREA.active === false)
            return await interaction.reply("The action is not active");
        if (AREA.CachedData == undefined)
            return await interaction.reply("No online channels found");
        if (AREA.CachedData.content == "error")
            return await interaction.reply(`An error occured while fetching the follwing channels : ${AREA.CachedData.error.message || ""}`);
        const Datas = AREA.CachedData;
        if (Datas.length === 0)
            return await interaction.reply("None of the channels you follow are online are currently online");

        const parsedData = Datas.map(data => {
            const started_at = new Date(data.started_at);
            data.started_at = `${started_at.getHours()}:${started_at.getMinutes()} ${started_at.getDate()}/${started_at.getMonth() + 1}/${started_at.getFullYear()}`;
            return {
                name: data.user_name,
                title: data.title,
                game_name: data.game_name,
                viewer_count: data.viewer_count,
                language: data.language,
                started_at: data.started_at,
                is_mature: data.is_mature
            };
        });

        const Messages = [];

        parsedData.forEach(data => {
            Messages.push(`Channel name: **${data.name}**\nLive's title: **${data.title}**\nLive's name : **${data.game_name}**\nViewers: **${data.viewer_count}**\nLanguage: **${data.language}**\nStarted at: **${data.started_at}**\n`);
            if (data.is_mature)
                Messages.push("⚠️ the content has been marked as restricted, the content is reserved for the adults \n");
            Messages.push("[link](https://twitch.tv/" + data.name + ")\n\n");

        });

        let finalMessage = "";
        await interaction.reply(`${AREA.Reaction.arguments.message}`);

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