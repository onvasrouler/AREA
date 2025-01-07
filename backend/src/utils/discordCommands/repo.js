const AreaModel = require("../../database/models/actionReaction.js");

module.exports = {
    data: {
        name: "repo",
        description: "get the list of repositories",
        default_member_permissions: null, // No specific permissions required
    },
    async execute(interaction) {
        const AREA = await AreaModel.findOne({
            "Action.arguments.userId": interaction.user.id,
            "Action.arguments.on": "/repo"
        });
        if (!AREA)
            return await interaction.reply("You have no actions set up for the command /repo");
        if (AREA.active === false)
            return await interaction.reply("The action is not active");
        if (AREA.CachedData == "error")
            return await interaction.reply("An error occured: **" + AREA.Errors.message + "** for the area with the name : **" + AREA.Name + "**");
        if (AREA.CachedData == undefined)
            return await interaction.reply("wait for the data to be fetched");

        const Datas = AREA.CachedData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 10);
        if (Datas.length === 0)
            return await interaction.reply("No repo found");
        const parsedData = Datas.map(data => {
            const date = new Date(data.created_at);
            const formattedDate = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            return {
                name: data.name,
                owner: data.owner.login,
                description: data.description,
                ssh_url: data.ssh_url,
                creation_date: formattedDate
            };
        });

        const Messages = [];

        parsedData.forEach(data => {
            Messages.push(`Title: **${data.name}**\nOwner: **${data.name}**\nDescription: **${data.description}**\nSsh Url: **${data.ssh_url}**\nCreation date: **${data.creation_date}**\n\n`);
        });

        let finalMessage = "";
        const avatarUrl = Datas[0].owner.avatar_url;
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