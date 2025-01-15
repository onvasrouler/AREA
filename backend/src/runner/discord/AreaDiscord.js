const ActionReactionModel = require("../../database/models/actionReaction");
const bot = require("../../utils/discord");

async function ActionDiscord(AREA) {
    console.log("Treating Discord Action : " + AREA.unique_id);
}

async function extractData(AREA, prefix) {
    try {
        let message = prefix + "\n" || "";

        if (AREA.CachedData == "error" || AREA.CachedData.status == "error") {
            message = "an error occured : **" + (AREA.Errors.message || " while fetching the data") + "** on the AREA with name : **" + AREA.Name + "**";
        } else {
            if (AREA.Action.service == "spotify") {
                if (AREA.Action.arguments.on == "currently_playing") {
                    message += "**" + AREA.CachedData.item.name + "** by **" + AREA.CachedData.item.artists[0].name + "** -> [link](" + AREA.CachedData.item.external_urls.spotify + ")";
                }
                else if (AREA.Action.arguments.on == "liked_track") {
                    let Datas = "";
                    AREA.CachedData.items.slice(0, 10).forEach(data => {
                        Datas += "**" + data.track.name + "** by **" + data.track.artists[0].name + "**\n";
                    });
                    message += Datas;
                }
                else if (AREA.Action.arguments.on == "new_liked_track") {
                    message += "**" + AREA.CachedData.items[0].track.name + "** by **" + AREA.CachedData.items[0].track.artists[0].name + "** -> [link](" + AREA.CachedData.items[0].track.external_urls.spotify + ")";
                }
            } else if (AREA.Action.service == "github") {
                if (AREA.Action.arguments.on == "new_repo") {
                    message += "**" + AREA.CachedData[0].name + "** created by ** " + AREA.CachedData[0].owner.login + "** -> [link](" + AREA.CachedData[0].html_url + ")";;
                } else if (AREA.Action.arguments.on == "new_issue") {
                    message += "**" + AREA.CachedData.items[0].title + "** created by ** " + AREA.CachedData.items[0].user.login + "** -> [link](" + AREA.CachedData.items[0].html_url + ")";;
                } else if (AREA.Action.arguments.on == "new_pr") {
                    message += "**" + AREA.CachedData.items[0].title + "** created by ** " + AREA.CachedData.items[0].user.login + "** -> [link](" + AREA.CachedData.items[0].html_url + ")";;
                } else if (AREA.Action.arguments.on == "new_commit") {
                    message += "**" + AREA.CachedData.items[0].commit.message + "** by ** " + AREA.CachedData.items[0].author.login + "** on repo **" + AREA.CachedData.items[0].repository.name + "** -> [link](" + AREA.CachedData.items[0].html_url + ")";;
                }
            } else if (AREA.Action.service == "twitch") {
                if (AREA.Action.arguments.on == "new_follow") {
                    message += "**" + AREA.tokens.twitch_user_data.login + "** now follow **" + AREA.CachedData.data[0].broadcaster_login + "**\n[profile picture](" + AREA.CachedData.data[0].broadcaster_info.profile_image_url + ")";
                } else if (AREA.Action.arguments.on == "following_online") {
                    message += "**" + AREA.CachedData[0].user_name + "** is now online : **" + AREA.CachedData[0].title + "**\nand is playing : **" + AREA.CachedData[0].game_name + "**" + (AREA.CachedData[0].is_mature ? "\n⚠️  the content has been marked as restricted, the content is reserved for the adults " : "") + "\n # [link](https://twitch.tv/" + AREA.CachedData[0].user_name + ")";
                }
            } else if (AREA.Action.service == "weather") {
                message += "place : ** " + AREA.Action.arguments.city + "**\n**" + AREA.CachedData.data.current.weather[0].description + "**\nTemperature : **" + AREA.CachedData.data.current.temp + "°C**\nFeels like : **" + AREA.CachedData.data.current.feels_like + "°C**\nHumidity : **" + AREA.CachedData.data.current.humidity + "%**";
            } else {
                console.error("Service not found : " + AREA.Action.service + " for action " + AREA.Action);
                message = "ERROR: Service not found : " + AREA.Action.service + " for action " + AREA.Action;
            }
        }
        return message;
    } catch (err) {
        console.error(err);
        return "An error occured";
    }
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
        const Arguments = actionReactions.Reaction.arguments;
        const Datas = await extractData(actionReactions, Arguments.message);
        if (Arguments.react == "message") {
            if (Arguments.channel == null) {
                console.error("Channel is missing");
                return;
            }
            if (Arguments.message == null) {
                console.error("Message is missing");
                return;
            }
            await bot.channels.cache.get(Arguments.channel).send(Datas);
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
                    return user.send(Datas);
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
        console.error("an error occured with area : " + actionReactions);
        return;
    }

}

module.exports = {
    ActionDiscord,
    ReactionDiscord
};