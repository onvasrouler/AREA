const AreaModel = require("../../database/models/actionReaction.js");
const axios = require("axios");

async function getTwitchChannelData(token, broadcaster_id) {
    try {
        const Response = await axios.get("https://api.twitch.tv/helix/users?id=" + broadcaster_id,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Client-ID": process.env.TWITCH_CLIENT_ID
                },
            }
        );
        return Response.data.data[0];
    } catch (err) {
        console.error(err);
        return { "ErrorOnSpotiFetch": err.response?.data ? err.response?.data : err };
    }
}

async function getMyFollowingOnline(token, user_id) {
    try {
        const Response = await axios.get("https://api.twitch.tv/helix/streams/followed?user_id=" + user_id,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Client-ID": process.env.TWITCH_CLIENT_ID
                },
            }
        );
        return Response.data.data;
    } catch (err) {
        console.error(err);
        return { "ErrorOnSpotiFetch": err.response?.data ? err.response?.data : err };
    }
}

module.exports = {
    data: {
        name: "following",
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
            "Action.arguments.on": "/following"
        });
        const { options } = interaction;
        const amount = options.getInteger("amount") || 10;
        if (amount <= 0 || amount > 100) {
            return await interaction.reply("The amount must be between 1 and 30");
        }
        if (AREA === null || AREA.length === 0)
            return await interaction.reply("You have no action/reaction setted up for the follwing channels");
        if (AREA.active === false)
            return await interaction.reply("The action is not active");
        if (AREA.CachedData == undefined)
            return await interaction.reply("No follwing channels found");
        if (AREA.CachedData.content == "error")
            return await interaction.reply(`An error occured while fetching the follwing channels : ${AREA.CachedData.error.message || ""}`);
        const Datas = AREA.CachedData.data;
        if (Datas.length === 0)
            return await interaction.reply("you don't have any follwing channels");

        const UserOnline = await getMyFollowingOnline(AREA.tokens.twitch, AREA.tokens.twitch_user_data.id);
        const parsedData = await Promise.all(Datas.map(async data => {
            const currentChannel = await getTwitchChannelData(AREA.tokens.twitch, data.broadcaster_id);
            if (UserOnline.find(user => user.user_id === currentChannel.id)) {
                currentChannel.online = true;
                currentChannel.title = UserOnline.find(user => user.user_id === currentChannel.id).title;
                currentChannel.viewer_count = UserOnline.find(user => user.user_id === currentChannel.id).viewer_count;
                const started_at = new Date(UserOnline.find(user => user.user_id === currentChannel.id).started_at);
                currentChannel.started_at = `${started_at.getHours()}:${started_at.getMinutes()} ${started_at.getDate()}/${started_at.getMonth() + 1}/${started_at.getFullYear()}`;
                currentChannel.game_name = UserOnline.find(user => user.user_id === currentChannel.id).game_name;
            } else
                currentChannel.online = false;
            return {
                name: currentChannel.display_name,
                description: currentChannel.description,
                online: currentChannel.online,
                title: currentChannel.title,
                viewer_count: currentChannel.viewer_count,
                started_at: currentChannel.started_at,
                game_name: currentChannel.game_name
            };
        }));

        const Messages = [];
        console.log(parsedData);

        parsedData.forEach(data => {
            Messages.push(`Channel name: **${data.name}**\nChannel description: **${data.description}**\nUser online : **${data.online == true ? "yes :green_circle:" : "no :red_circle:"}**\n`);
            if (data.online) {
                Messages.push(`Title: **${data.title}**\nViewers: **${data.viewer_count}**\nGame: **${data.game_name}**\nStarted at: **${data.started_at}**\n\n`);
            } else
                Messages.push("\n");

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