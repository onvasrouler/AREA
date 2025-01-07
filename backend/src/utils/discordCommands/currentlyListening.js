const AreaModel = require("../../database/models/actionReaction.js");

module.exports = {
    data: {
        name: "spotiplaying",
        description: "get the music the user is currently listening to",
        default_member_permissions: null, // No specific permissions required
    },
    async execute(interaction) {
        const AREA = await AreaModel.findOne({
            "Action.arguments.userId": interaction.user.id,
            "Action.arguments.on": "/spotiplaying"
        });
        if (AREA === null || AREA.length === 0)
            return await interaction.reply("You have no action/reaction setted up for the music currently playing");
        if (AREA.active === false)
            return await interaction.reply("The action is not active");
        if (AREA.CachedData == undefined)
            return await interaction.reply("Not currently listening to anything");

        if (AREA.CachedData.content == "error")
            return await interaction.reply(`An error occured while fetching the music you are listening : ${AREA.CachedData.error.message || ""}`);
        const Datas = AREA.CachedData.item;
        let message;
        if (AREA.CachedData.currently_playing_type === "track")
            message = `${(AREA.Reaction.arguments.prefix || "you are listening to : ")}\n**${Datas.name}** by **${Datas.artists[0].name}** -> [link](${Datas.external_urls.spotify})`;
        await interaction.reply(message);
    }
};