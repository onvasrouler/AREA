const api_formatter = require("../../middleware/api-formatter.js");
const discordBot = require("../../utils/discord.js");
const axios = require("axios");
const AreaModel = require("../../database/models/actionReaction.js");

exports.discordCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "no code", "code is required", null, null, null);
        try {
            const params = new URLSearchParams();
            params.append("client_id", discordBot.user.id);
            params.append("client_secret", process.env.DISCORD_SECRET);
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);
            params.append("scope", "identify guilds");

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: "POST",
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            });
            let parsedData = await response.json();
            if (!parsedData.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, parsedData);
            if (parsedData.access_token) {
                parsedData.expires_at = Date.now() + (parsedData.expires_in * 1000);
                req.user.discord_token = parsedData;
                await req.user.save();
                return api_formatter(req, res, 200, "success", "Discord token has been saved");
            } else {
                console.error(parsedData);
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, parsedData);
            }
        } catch (error) {
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, err);
    }
};

exports.discordRefresh = async (req, res) => {
    try {
        const discord_token = req.user.discord_token;
        if (!discord_token)
            return api_formatter(req, res, 400, "error", "you first have to login to discord to be able to refresh your token", null, null, null);
        const refresh_token = discord_token.refresh_token;
        if (!refresh_token)
            return api_formatter(req, res, 400, "error", "you first have to login to discord to be able to refresh your token", null, null, null);
        try {
            const params = new URLSearchParams();
            params.append("client_id", discordBot.user.id);
            params.append("client_secret", process.env.DISCORD_SECRET);
            params.append("grant_type", "refresh_token");
            params.append("refresh_token", refresh_token);
            params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);
            params.append("scope", "identify guilds");

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: "POST",
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            });
            const parsedData = await response.json();
            if (!parsedData.access_token)
                return api_formatter(req, res, 500, "error", "An error occurred while trying to refresh the discord token", null, parsedData);
            req.user.discord_token = parsedData;
            await req.user.save();
            const areas = await AreaModel.find({ creator_id: req.user.unique_id });
            for (const area of areas) {
                if (area.service == "discord") {
                    area.tokens.discord = req.user.discord_token.access_token;
                    await area.save();
                }
            }
            return api_formatter(req, res, 200, "success", "Discord token has been saved");
        } catch (error) {
            console.error(error.response?.data);
            req.user.discord_token = {};
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token re log-in discord", null, error);

        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, err);
    }
};

exports.discordCallbackMobile = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "no code", "code is required when trying to generate a token with the mobile client", null, null, null);
        try {
            const params = new URLSearchParams();
            params.append("client_id", discordBot.user.id);
            params.append("client_secret", process.env.DISCORD_SECRET);
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI_MOBILE);
            params.append("scope", "identify guilds");

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: "POST",
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            });
            let parsedData = await response.json();
            if (!parsedData.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token on mobile", null, parsedData);
            if (parsedData.access_token) {
                parsedData.expires_at = Date.now() + (parsedData.expires_in * 1000);
                req.user.discord_token = parsedData;
                await req.user.save();
                return api_formatter(req, res, 200, "success", "Discord token has been saved for the mobile client");
            } else {
                console.error(parsedData);
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token on mobile", null, parsedData);
            }
        } catch (error) {
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token on mobile", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token on mobile", null, err);
    }
};

exports.discordRefreshMobile = async (req, res) => {
    try {
        const discord_token = req.user.discord_token;
        if (!discord_token)
            return api_formatter(req, res, 400, "error", "you first have to login to discord with the mobile client to be able to refresh your token", null, null, null);
        const refresh_token = discord_token.refresh_token;
        if (!refresh_token)
            return api_formatter(req, res, 400, "error", "you first have to login to discord with the mobile client to be able to refresh your token ", null, null, null);
        try {
            const params = new URLSearchParams();
            params.append("client_id", discordBot.user.id);
            params.append("client_secret", process.env.DISCORD_SECRET);
            params.append("grant_type", "refresh_token");
            params.append("refresh_token", refresh_token);
            params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI_MOBILE);
            params.append("scope", "identify guilds");

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: "POST",
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            });
            const parsedData = await response.json();
            if (!parsedData.access_token)
                return api_formatter(req, res, 500, "error", "An error occurred while trying to refresh the discord token", null, parsedData);
            req.user.discord_token = parsedData;
            await req.user.save();
            const areas = await AreaModel.find({ creator_id: req.user.unique_id });
            for (const area of areas) {
                if (area.service == "discord") {
                    area.tokens.discord = req.user.discord_token.access_token;
                    await area.save();
                }
            }
            return api_formatter(req, res, 200, "success", "Discord token has been saved for the mobile client");
        } catch (error) {
            console.error(error.response?.data);
            req.user.discord_token = {};
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token re log-in discord with the mobile client", null, error);

        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token with the mobile client", null, err);
    }
};


exports.githubCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "error", "code is required", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://github.com/login/oauth/access_token",
                {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_SECRET,
                    code: code
                },
                {
                    headers: { Accept: "application/json" },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the github token", null, tokenResponse.data);

            req.user.github_token = tokenResponse.data;
            await req.user.save();
            return api_formatter(req, res, 200, "success", "Github token has been saved");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the github token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the github token", null, err);
    }
};

exports.githubRefresh = async (req, res) => {
    try {
        const github_token = req.user.github_token;
        if (!github_token)
            return api_formatter(req, res, 400, "error", "you first have to login to github to be able to refresh your token", null, null, null);
        const refresh_token = github_token.refresh_token;
        if (!refresh_token)
            return api_formatter(req, res, 400, "error", "you first have to login to github to be able to refresh your token", null, null, null);
        try {
            const params = new URLSearchParams();
            params.append("client_id", process.env.GITHUB_CLIENT_ID);
            params.append("client_secret", process.env.GITHUB_SECRET);
            params.append("grant_type", "refresh_token");
            params.append("refresh_token", refresh_token);

            const response = await axios.post("https://github.com/login/oauth/access_token", params, {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                },
            });

            const parsedData = response.data;
            if (!parsedData.access_token)
                return api_formatter(req, res, 500, "error", "An error occurred while trying to refresh the github token", null, parsedData);

            req.user.github_token = parsedData;
            await req.user.save();
            const areas = await AreaModel.find({ creator_id: req.user.unique_id });
            for (const area of areas) {
                if (area.service == "github") {
                    area.tokens.github = req.user.github_token.access_token;
                    await area.save();
                }
            }
            return api_formatter(req, res, 200, "success", "Github token has been refreshed");
        } catch (error) {
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the github token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the github token", null, err);
    }
};
