const ActionReactionModel = require("../../database/models/actionReaction");
const axios = require("axios");

async function getSpotifyUserData(token, url) { // type can be pr or issue
    const Response = await axios.get(
        url,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return Response.data;
}

async function ActionSpotify(AREA) {
    console.log("Treating Spotify Action : " + AREA.unique_id);
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
            Datas = "error";
        }
        if (Datas == "error")
            return;

        actionReactions.CachedData = Datas;
        actionReactions.CachedData.content = actionReactions.Reaction.arguments.content;
        await actionReactions.save();
        return;
    } catch (err) {
        console.error(err);
        console.error(err.response?.data);
        return;
    }
}

module.exports = {
    ActionSpotify,
    ReactionSpotify
};