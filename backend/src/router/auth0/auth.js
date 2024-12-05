const UserModel = require("../../database/models/users");
const api_formatter = require("../../middleware/api-formatter.js");
const discordBot = require('../../utils/discord');

exports.googleAuth = async (req, res) => {
    try {
        const { googleToken } = req.body;
        req.user.auth_token.google = googleToken;
        await req.user.save();
        return api_formatter(req, res, 200, "success", "Google token has been saved");
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to save the google token", null, err);
    }
}

exports.discordCallback = async (req, res) => {
    try {
        const { code } = req.body;
        try {
            const params = new URLSearchParams();
            params.append('client_id', discordBot.user.id);
            params.append('client_secret', process.env.DISCORD_SECRET);
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
            params.append('redirect_uri', process.env.DISCORD_REDIRECT_URI);
            params.append('scope', 'identify guilds');

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: 'POST',
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            });
            req.user = await UserModel.findOne({ email: "aimeric.rouyer@gmail.com" });
            let parsedData = await response.json();
            if (parsedData.access_token) {
                parsedData.expires_at = Date.now() + (parsedData.expires_in * 1000);
                req.user.discord_token = parsedData;
                await req.user.save();
                return api_formatter(req, res, 200, "success", "Discord token has been saved");
            } else {
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
}

exports.discordRefresh = async (req, res) => {
    try {
        const { refresh_token } = req.body;
        try {
            const params = new URLSearchParams();
            params.append('client_id', discordBot.user.id);
            params.append('client_secret', process.env.DISCORD_SECRET);
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', refresh_token);
            params.append('redirect_uri', process.env.DISCORD_REDIRECT_URI);
            params.append('scope', 'identify guilds');

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: 'POST',
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            });
            const parsedData = await response.json();
            req.user.auth_token.discord = parsedData
            await req.user.save();
            return api_formatter(req, res, 200, "success", "Discord token has been saved");
        } catch (error) {
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, err);
    }
}