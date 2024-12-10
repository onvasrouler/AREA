const ActionReactionModel = require("../../database/models/actionReaction");
const bot = require("../../utils/discord");

async function ActionDiscord(AREA) {
    console.log("Treating Discord Action : " + AREA.unique_id);
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
            await bot.channels.cache.get(Arguments.channel).send(Arguments.message);
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
                    return user.send(Arguments.message);
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
        return;
    }

}

module.exports = {
    ActionDiscord,
    ReactionDiscord
};