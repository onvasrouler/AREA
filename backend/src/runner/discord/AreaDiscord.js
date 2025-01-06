const ActionReactionModel = require("../../database/models/actionReaction");
const bot = require("../../utils/discord");

async function ActionDiscord(AREA) {
    console.log("Treating Discord Action : " + AREA.unique_id);
}

async function extractData(AREA) {
    if (AREA.Action.service == "spotify") {
        if (AREA.Action.arguments.on == "currently_playing") {
            return AREA.CachedData.item.name + " by " + AREA.CachedData.item.artists[0].name + " : " + AREA.CachedData.item.external_urls.spotify;
        }
        if (AREA.Action.arguments.on == "liked_track") {
            let Datas = "";
            AREA.CachedData.items.slice(0, 10).forEach(data => {
                Datas += data.track.name + " by " + data.track.artists[0].name + "\n";
            });
            return Datas;
        }
        if (AREA.Action.arguments.on == "new_liked_track") {
            return AREA.CachedData.items[0].track.name + " by " + AREA.CachedData.items[0].track.artists[0].name + " : " + AREA.CachedData.items[0].track.external_urls.spotify;
        }
    }
    return "";
}

async function ReactionDiscord(AREA) {
    const actionReactions = await ActionReactionModel.findOne({ "unique_id": AREA.unique_id });
    try {

        if (!actionReactions) {
            console.error("ActionReaction not found");
            return;
        }
        if (actionReactions.Reaction.service != "discord") {
            console.error("Reaction service is not discord");
            return;
        }
        if (actionReactions.Treated == true)
            return;
        if (actionReactions.tokens.discord == null) {
            console.error("Discord token is missing");
            return;
        }
        if (actionReactions.CachedData == "error")
            return;
        const Datas = await extractData(actionReactions);

        const Arguments = actionReactions.Reaction.arguments;
        if (Arguments.react == "message") {
            if (Arguments.channel == null) {
                console.error("Channel is missing");
                return;
            }
            if (Arguments.message == null) {
                console.error("Message is missing");
                return;
            }
            await bot.channels.cache.get(Arguments.channel).send(Arguments.message + Datas);
        } else if (Arguments.react == "private_message") {
            if (Arguments.userId == null) {
                console.error("userId is missing");
                return;
            }
            if (Arguments.message == null) {
                console.error("Message is missing");
                return;
            }
            await bot.users.fetch(Arguments.userId)
                .then(user => {
                    return user.send(Arguments.message + Datas);
                })
                .catch(error => {
                    console.error("Error sending message:", error);
                });
        }
        actionReactions.Treated = true;
        await actionReactions.save();
        return;
    } catch (err) {
        console.error(err);
        console.error(err.response?.data);
        console.error("an error occured with area : " + actionReactions)
        return;
    }

}

module.exports = {
    ActionDiscord,
    ReactionDiscord
};