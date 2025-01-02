const api_formatter = require("../../../middleware/api-formatter.js");
const axios = require("axios");
const AreaModel = require("../../../database/models/actionReaction.js");

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
            await req.user.save();
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
                    client_secret: process.env.SPOTIFY_SECRET,
                    refresh_token: refresh_token,
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

            req.user.spotify_token = tokenResponse.data;
            await req.user.save();
            const areas = await AreaModel.find({ creator_id: req.user.unique_id });
            for (const area of areas) {
                if (area.service == "spotify") {
                    area.tokens.spotify = req.user.spotify_token.access_token;
                    await area.save();
                }
            }
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
            await req.user.save();
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