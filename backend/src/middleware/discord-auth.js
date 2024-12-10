const api_formatter = require("./api-formatter.js");
const axios = require("axios");
const discordBot = require("../utils/discord.js");

async function discordAuth(req, res, next) {
    try {
        req.guilds = null;

        let discordCachedData = req.cachedData.data.discordCachedData;
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error
        if (!req.user.discord_token.access_token) // if the user doesn't have a discord token
            return api_formatter(req, res, 401, "discordNotLoggedin", "you are not logged in using discord", null, null, null); // return a 401 error
        if (req.user.discord_token.expires_at < Date.now())
            return api_formatter(req, res, 401, "tokenExpired", "your discord token is expired", null, null, null); // return a 401 error
        if (!discordCachedData || discordCachedData.updatedAt + 60 < Date.now()) {
            const userServers = await axios.get("https://discord.com/api/users/@me/guilds", {
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
                discordCachedData: DiscordData
            };
            await req.cachedData.save();
            discordCachedData = DiscordData;
        }
        const userGuilds = discordCachedData.data;
        const botGuilds = Array.from(discordBot.guilds.cache.values()).map((guild) => guild.id);
        const matchingGuilds = userGuilds.filter((guild) => {
            const hasAdminPermission = (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8);
            return botGuilds.includes(guild.id) && hasAdminPermission;
        });
        req.guilds = matchingGuilds;
        return next();
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord server", null, err, null);
    }
}

module.exports = discordAuth;