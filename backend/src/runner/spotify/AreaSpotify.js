const ActionReactionModel = require("../../database/models/actionReaction");
const axios = require("axios");

async function getSpotifyUserData(token, url) { // type can be pr or issue
    try {
        const Response = await axios.get(
            url,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        return Response.data;
    } catch (err) {
        return { "ErrorOnSpotiFetch": err.response?.data ? err.response?.data : err };
    }
}

async function ActionSpotify(AREA) {
    const actionReactions = await ActionReactionModel.findOne({ "unique_id": AREA.unique_id });
    let Datas = "";
    try {
        if (!actionReactions) {
            console.error("ActionReaction not found");
            return;
        }
        if (actionReactions.Action.service != "spotify") {
            console.error("Action service is not spotify");
            return;
        }
        if (actionReactions.tokens.spotify == null) {
            console.error("spotify token is missing");
            return;
        }
        const TriggerEvent = actionReactions.Action.arguments.on;
        switch (TriggerEvent) {
            case "currently_playing":
                Datas = await getSpotifyUserData(actionReactions.tokens.spotify, "https://api.spotify.com/v1/me/player/currently-playing");
                break;
            case "liked_track":
                Datas = await getSpotifyUserData(actionReactions.tokens.spotify, "https://api.spotify.com/v1/me/tracks?limit=31");
                break;
            case "new_liked_track":
                Datas = await getSpotifyUserData(actionReactions.tokens.spotify, "https://api.spotify.com/v1/me/tracks?limit=31");
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

        //avoid treating the same data twice and avoid treating data that has already been treated and avoid treating data when it decrease
        if (TriggerEvent == "new_liked_track") {
            if (Datas.total != 0) {
                if (actionReactions.CachedData.total === Datas.total && actionReactions.CachedData.items[0].track.id === Datas.items[0].track.id) {
                    actionReactions.Treated = true;
                } else if (actionReactions.CachedData.total < Datas.total && actionReactions.CachedData != "") {
                    actionReactions.Treated = false;
                }
            }
        } else if (TriggerEvent == "liked_track") {
            if (Datas.total != 0) {
                if (actionReactions.CachedData.total === Datas.total && actionReactions.CachedData.items[0].track.id === Datas.items[0].track.id) {
                    actionReactions.Treated = true;
                } else if (actionReactions.CachedData.total && actionReactions.CachedData.total != 0 && actionReactions.CachedData != "")
                    actionReactions.Treated = false;
            }
        } else if (TriggerEvent == "currently_playing") {
            if (Datas != "") {
                if (actionReactions.CachedData.item && actionReactions.CachedData.item.id === Datas.item.id) {
                    actionReactions.Treated = true;
                } else if (Datas != "" && actionReactions.CachedData != "" && actionReactions.CachedData.item != null) {
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
        console.error("An error occured :\n" + err + "\nWith data :\n" + Datas);

        return;
    }
}

async function ReactionSpotify(AREA) {
    const actionReactions = await ActionReactionModel.findOne({ "unique_id": AREA.unique_id });
    try {
        if (!actionReactions) {
            console.error("ActionReaction not found");
            return;
        }
        if (actionReactions.Reaction.service != "spotify") {
            console.error("Action service is not spotify");
            return;
        }
        if (actionReactions.tokens.spotify == null) {
            console.error("spotify token is missing");
            return;
        }

        let Datas = "";
        switch (actionReactions.Reaction.arguments.content) {
            case "currently_playing":
                Datas = await getSpotifyUserData(actionReactions.tokens.spotify, "https://api.spotify.com/v1/me/player/currently-playing");
                break;
            case "liked_track":
                Datas = await getSpotifyUserData(actionReactions.tokens.spotify, "https://api.spotify.com/v1/me/tracks?limit=31");
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
        await ActionReactionModel.updateOne(
            { "unique_id": actionReactions.unique_id },
            {
                $set: {
                    Errors: "null",
                    CachedData: Datas,
                    Treated: actionReactions.Treated,
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
                actionReactions.CachedData = err.response?.data;
                actionReactions.CachedData.content = "error";
                await actionReactions.save();
            } catch (err) {
                console.error(err);
                return;
            }
        }
        return;
    }
}

module.exports = {
    ActionSpotify,
    ReactionSpotify
};