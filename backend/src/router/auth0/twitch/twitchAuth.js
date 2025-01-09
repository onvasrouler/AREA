const api_formatter = require("../../../middleware/api-formatter.js");
const axios = require("axios");
const AreaModel = require("../../../database/models/actionReaction.js");

async function updateUserAreas(AreaUser, UserToken) {
    let areas = await AreaModel.find({ creator_id: AreaUser.unique_id });
    for (let area of areas)
        if (area.tokens && area.tokens.twitch)
            await AreaModel.updateOne(
                { unique_id: area.unique_id },
                { $set: { "tokens.twitch": UserToken } }
            );
}

exports.twitchCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "error", "code is required", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://id.twitch.tv/oauth2/token",
                new URLSearchParams({
                    client_id: process.env.TWITCH_CLIENT_ID,
                    client_secret: process.env.TWITCH_SECRET,
                    code: code,
                    grant_type: "authorization_code",
                    redirect_uri: process.env.TWITCH_REDIRECT_URI
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the twitch token", null, tokenResponse.data);

            req.user.twitch_token = tokenResponse.data;
            req.user.twitch_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Twitch token has been saved");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the twitch token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the twitch token", null, err);
    }
}

exports.twitchCallbackMobile = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "error", "code is required", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://id.twitch.tv/oauth2/token",
                new URLSearchParams({
                    client_id: process.env.TWITCH_CLIENT_ID,
                    client_secret: process.env.TWITCH_SECRET,
                    code: code,
                    grant_type: "authorization_code",
                    redirect_uri: process.env.TWITCH_REDIRECT_URI_MOBILE
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the twitch token", null, tokenResponse.data);

            req.user.twitch_token = tokenResponse.data;
            req.user.twitch_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Twitch token has been saved");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the twitch token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the twitch token", null, err);
    }
}

exports.twitchRefresh = async (req, res) => {
    try {
        const twitch_token = req.user.twitch_token;
        if (!twitch_token)
            return api_formatter(req, res, 400, "error", "you first have to login to twitch to be able to refresh your token", null, null, null);
        const refresh_token = twitch_token.refresh_token;
        if (!refresh_token)
            return api_formatter(req, res, 400, "error", "you first have to login to twitch to be able to refresh your token", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://id.twitch.tv/oauth2/token",
                new URLSearchParams({
                    client_id: process.env.TWITCH_CLIENT_ID,
                    refresh_token: refresh_token,
                    client_secret: process.env.TWITCH_SECRET,
                    grant_type: "refresh_token",
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the twitch token", null, tokenResponse.data);

            req.user.twitch_token = tokenResponse.data;
            req.user.twitch_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Twitch token has been saved");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the twitch token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the twitch token", null, err);
    }
}
