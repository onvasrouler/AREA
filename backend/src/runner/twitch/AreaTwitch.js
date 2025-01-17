const ActionReactionModel = require("../../database/models/actionReaction");
const axios = require("axios");

async function getTwitchUserData(token, url) { // type can be pr or issue
    try {
        const Response = await axios.get(
            url,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Client-ID": process.env.TWITCH_CLIENT_ID
                },
            }
        );
        return Response.data;
    } catch (err) {
        console.error(err);
        return { "ErrorOnSpotiFetch": err.response?.data ? err.response?.data : err };
    }
}

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

async function ActionTwitch(AREA) {
    const actionReactions = await ActionReactionModel.findOne({ "unique_id": AREA.unique_id });
    let Datas = "";
    try {
        if (!actionReactions) {
            console.error("ActionReaction not found");
            return;
        }
        if (actionReactions.Action.service != "twitch") {
            console.error("Action service is not twitch");
            return;
        }
        if (actionReactions.tokens.twitch == null) {
            console.error("twitch token is missing");
            return;
        }
        const TriggerEvent = actionReactions.Action.arguments.on;
        switch (TriggerEvent) {
            case "new_follow":
                Datas = await getTwitchUserData(actionReactions.tokens.twitch, "https://api.twitch.tv/helix/channels/followed?user_id=" + actionReactions.tokens.twitch_user_data.id);
                break;
            case "following_online":
                Datas = await getMyFollowingOnline(actionReactions.tokens.twitch, actionReactions.tokens.twitch_user_data.id);
                break;
            default:
                console.error("Unknown action");
                Datas = "UnknownAction";
        }
        if (Datas == "UnknownAction")
            return;
        if (Datas.ErrorOnTwitchFetch) {
            await ActionReactionModel.updateOne(
                { "unique_id": actionReactions.unique_id },
                {
                    $set: {
                        Errors: Datas.ErrorOnTwitchFetch.error || Datas.ErrorOnTwitchFetch,
                        CachedData: "error",
                        Treated: actionReactions.CachedData != "error" ? false : true
                    }
                }
            );
            return;
        }
        //avoid treating the same data twice and avoid treating data that has already been treated and avoid treating data when it decrease
        if (TriggerEvent == "new_follow") {
            if (Datas.total > 0) {
                Datas.data.sort((a, b) => new Date(b.followed_at) - new Date(a.followed_at));
                if (actionReactions.CachedData.total === Datas.total && actionReactions.CachedData.data[0].broadcaster_id === Datas.data[0].broadcaster_id) {
                    actionReactions.Treated = true;
                } else if (actionReactions.CachedData.total < Datas.total && actionReactions.CachedData != "") {
                    actionReactions.Treated = false;
                    Datas.data[0].broadcaster_info = await getTwitchChannelData(actionReactions.tokens.twitch, Datas.data[0].broadcaster_id);
                }
            }
        } else if (TriggerEvent == "following_online") {
            if (Datas[0] != undefined) {
                Datas.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
                if (actionReactions.CachedData.length === Datas.length && actionReactions.CachedData[0].id === Datas[0].id) {
                    actionReactions.Treated = true;
                } else if (actionReactions.CachedData.length < Datas.length && actionReactions.CachedData != "") {
                    actionReactions.Treated = false;
                }
            }
        }
        await ActionReactionModel.updateOne(
            { "unique_id": actionReactions.unique_id },
            {
                $set: {
                    Errors: "null",
                    CachedData: Datas,
                    Treated: actionReactions.Treated
                }
            }
        );
        return;
    } catch (err) {
        console.error("An error occured on action twitch :\n" + err + "\nWith data :\n" + Datas);

        return;
    }
}

async function ReactionTwitch(AREA) {
    const actionReactions = await ActionReactionModel.findOne({ "unique_id": AREA.unique_id });
    try {
        if (!actionReactions) {
            console.error("ActionReaction not found");
            return;
        }
        if (actionReactions.Reaction.service != "twitch") {
            console.error("Action service is not twitch");
            return;
        }
        if (actionReactions.tokens.twitch == null) {
            console.error("twitch token is missing");
            return;
        }

        let Datas = "";
        const TriggerEvent = actionReactions.Reaction.arguments.content;
        switch (TriggerEvent) {
            case "following":
                Datas = await getTwitchUserData(actionReactions.tokens.twitch, "https://api.twitch.tv/helix/channels/followed?user_id=" + actionReactions.tokens.twitch_user_data.id);
                break;
            case "following_online":
                Datas = await getMyFollowingOnline(actionReactions.tokens.twitch, actionReactions.tokens.twitch_user_data.id);
                break;
            default:
                console.error("Unknown action");
                Datas = "UnknownAction";
        }
        if (Datas == "UnknownAction")
            return;
        if (Datas.ErrorOnSpotiFetch) {
            await ActionReactionModel.updateOne(
                { "unique_id": actionReactions.unique_id },
                {
                    $set: {
                        Errors: Datas.ErrorOnSpotiFetch.error || Datas.ErrorOnSpotiFetch,
                        CachedData: "error",
                        Treated: actionReactions.CachedData != "error" ? false : true
                    }
                }
            );
            return;
        }
        if (TriggerEvent == "following") {
            Datas.data.sort((a, b) => new Date(b.followed_at) - new Date(a.followed_at));
        } else if (TriggerEvent == "following_online") {
            Datas.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
        }
        await ActionReactionModel.updateOne(
            { "unique_id": actionReactions.unique_id },
            {
                $set: {
                    Errors: "null",
                    Treated: true,
                    CachedData: Datas,
                    "CachedData.content": actionReactions.Reaction.arguments.content
                }
            }
        );

        return;
    } catch (err) {
        console.error(err);
        if (err.response?.data) {
            console.error(err.response?.data);
            try {
                await ActionReactionModel.updateOne(
                    { "unique_id": actionReactions.unique_id },
                    {
                        $set: {
                            Errors: err.response?.data,
                            CachedData: "error",
                        }
                    }
                );

            } catch (err) {
                console.error(err);
                return;
            }
        }
        return;
    }
}

module.exports = {
    ActionTwitch,
    ReactionTwitch
};