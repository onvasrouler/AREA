const api_formatter = require("./api-formatter.js");
const axios = require("axios");

async function discordGuilds(req, res, next) {
    try {
        req.discordUser = null;

        let discordUserCachedData = req.cachedData.data.discordUserCachedData;
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error
        if (!req.user.discord_token.access_token) // if the user doesn't have a discord token
            return api_formatter(req, res, 401, "discordNotLoggedin", "you are not logged in using discord", null, null, null); // return a 401 error
        if (req.user.discord_token.expires_at < Date.now())
            return api_formatter(req, res, 401, "tokenExpired", "your discord token is expired", null, null, null); // return a 401 error
        if (!discordUserCachedData || (discordUserCachedData.updatedAt + 1000) < Date.now()) {
            const userServers = await axios.get("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `Bearer ${req.user.discord_token.access_token}`,
                },
            });
            const DiscordData = {
                data: userServers.data,
                updatedAt: Date.now(),

            };
            req.cachedData.data = {
                ...req.cachedData.data,
                discordUserCachedData: DiscordData
            };
            await req.cachedData.save();
            discordUserCachedData = DiscordData;
        }
        req.discordUser = discordUserCachedData.data;
        return next();
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord server", null, err, null);
    }
}

module.exports = discordGuilds;