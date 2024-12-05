const UserModel = require("../database/models/users.js");
const api_formatter = require("./api-formatter.js");
const axios = require('axios');
const discordBot = require('../utils/discord.js');

async function discordAuth(req, res, next) {
    try {
        req.guilds = null;

        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error
        if (!req.user.discord_token.access_token) // if the user doesn't have a discord token
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in using discord", null, null, null); // return a 401 error
        if (req.user.discord_token.expires_at < Date.now())
            return api_formatter(req, res, 401, "notloggedin", "your discord token is expired", null, null, null); // return a 401 error

        const userServers = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.user.discord_token.access_token}`,
            },
        });
        const userGuilds = userServers.data;
        const botGuilds = discordBot.guilds.cache.map((guild) => guild.id);
        //the user is admin of the guild and the bot is in the guild
        const mathingGuilds = userGuilds.filter((guild) => {
            return botGuilds.includes(guild.id) && guild.owner === true && guild.permissions === 2147483647;
        });
        req.guilds = mathingGuilds;
        return next();
    } catch (err) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord server", null, err, null);
    }
}

module.exports = discordAuth;