const AreaModel = require("../../database/models/actionReaction.js");

module.exports = {
    data: {
        name: "likedtrack",
        description: "get the user's liked track",
        default_member_permissions: null, // No specific permissions required
        options: [
            {
                name: "amount",
                description: "The amount of liked track to display",
                type: "INTEGER",
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const AREA = await AreaModel.findOne({
            "Action.arguments.userId": interaction.user.id,
            "Action.arguments.on": "/likedtrack"
        });
        const { options } = interaction;
        const amount = options.getInteger("amount") || 10;
        if (amount <= 0 || amount > 100) {
            return await interaction.reply("The amount must be between 1 and 30");
        }
        if (AREA === null || AREA.length === 0)
            return await interaction.reply("You have no action/reaction setted up for the liked track");
        if (AREA.active === false)
            return await interaction.reply("The action is not active");
        if (AREA.CachedData == undefined)
            return await interaction.reply("No liked track found");
        if (AREA.CachedData.content == "error")
            return await interaction.reply(`An error occured while fetching the liked track : ${AREA.CachedData.error.message || ""}`);
        const Datas = AREA.CachedData.items;
        if (Datas.length === 0)
            return await interaction.reply("you don't have any liked track");
        const parsedData = Datas.map(data => ({
            artists: data.track.artists[0].name,
            name: data.track.name,
            duration: Math.round(data.track.duration_ms / 1000),
        }));

        const Messages = [];

        parsedData.forEach(data => {
            Messages.push(`Artist: **${data.artists}**\nTrack name: **${data.name}**\nTrack duration: **${data.duration}s**\n\n`);
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