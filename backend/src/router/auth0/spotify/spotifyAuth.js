const api_formatter = require("../../../middleware/api-formatter.js");
const axios = require("axios");
const AreaModel = require("../../../database/models/actionReaction.js");

async function updateUserAreas(AreaUser, UserToken) {
    let areas = await AreaModel.find({ creator_id: AreaUser.unique_id });
    for (let area of areas)
        if (area.tokens && area.tokens.spotify)
            await AreaModel.updateOne(
                { unique_id: area.unique_id },
                { $set: { "tokens.spotify": UserToken } }
            );
}

exports.spotifyCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "error", "code is required", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://accounts.spotify.com/api/token",
                new URLSearchParams({
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    client_secret: process.env.SPOTIFY_SECRET,
                    code: code,
                    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                    grant_type: "authorization_code",
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token", null, tokenResponse.data);

            req.user.spotify_token = tokenResponse.data;
            req.user.spotify_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Spotify token has been saved");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token", null, err);
    }
};

exports.spotifyRefresh = async (req, res) => {
    try {
        const spotify_token = req.user.spotify_token;
        if (!spotify_token)
            return api_formatter(req, res, 400, "error", "you first have to login to spotify to be able to refresh your token", null, null, null);
        const refresh_token = spotify_token.refresh_token;
        if (!refresh_token)
            return api_formatter(req, res, 400, "error", "you first have to login to spotify to be able to refresh your token", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://accounts.spotify.com/api/token",
                new URLSearchParams({
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    refresh_token: refresh_token,
                    client_secret: process.env.SPOTIFY_SECRET,
                    grant_type: "refresh_token",
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the spotify token", null, tokenResponse.data);
            if (!tokenResponse.data.refresh_token)
                tokenResponse.data.refresh_token = refresh_token;
            req.user.spotify_token = tokenResponse.data;
            req.user.spotify_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Spotify token has been refreshed");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the spotify token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the spotify token", null, err);
    }
};

exports.spotifyCallbackMobile = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "error", "code is required", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://accounts.spotify.com/api/token",
                new URLSearchParams({
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    client_secret: process.env.SPOTIFY_SECRET,
                    code: code,
                    redirect_uri: process.env.SPOTIFY_REDIRECT_URI_MOBILE,
                    grant_type: "authorization_code",
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token on mobile", null, tokenResponse.data);

            req.user.spotify_token = tokenResponse.data;
            req.user.spotify_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Spotify token has been saved using mobile auth");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token on mobile", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token on mobile", null, err);
    }
};

exports.logoutSpotify = async (req, res) => {
    try {
        req.user.spotify_token = {};
        await req.user.save();
        const areas = await AreaModel.find({ creator_id: req.user.unique_id });
        for (const area of areas) {
            if (area.service == "spotify") {
                area.tokens.spotify = "";
                await area.save();
            }
        }
        return api_formatter(req, res, 200, "success", "Spotify token has been deleted");
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to delete the spotify token", null, err);
    }
};
