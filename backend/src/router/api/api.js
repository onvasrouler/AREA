const api_formatter = require("../../middleware/api-formatter.js");
const axios = require("axios");
const discordBot = require("../../utils/discord");

// This function will return the user profile
exports.profile = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error
        let logged_in_discord = req.user.discord_token != {} &&
            req.user.discord_token.access_token != null ? true : false;
        if (logged_in_discord && req.user.discord_token.expires_at < Date.now())
            logged_in_discord = "session_expired"
        const user_infos = { // this will store the user informations
            "username": req.user.username,
            "email": req.user.email,
            "account_type": req.user.accountType,
            "logged_in_discord": logged_in_discord,
            "logged_in_github": req.user.github_token.access_token ? true : false,
        };
        return api_formatter(req, res, 200, "success", "you are authenticated", user_infos, null, null); // return the user informations
    } catch (err) { // if an error occured
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the user profile", null, err, null);
    }
};

exports.inviteDiscordBot = async (req, res) => {
    try {
        const discordClientId = discordBot.user.id;
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&permissions=8&scope=bot%20applications.commands`;
        return api_formatter(req, res, 200, "success", "discord invitation link getted with success", inviteLink, null, null); // return the user informations
    } catch (err) { // if an error occured
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord invitation link", null, err, null);
    }
};


// This function will return the discord server where the user is admin
exports.getDiscordServer = async (req, res) => {
    try {
        const matchingGuilds = req.guilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon
        }));
        return api_formatter(req, res, 200, "success", "list of matching guilds get with success", matchingGuilds, null, null); // return the user informations
    } catch (err) { // if an error occured
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the list of matching discord servers", null, err, null);
    }
};

exports.getListOfChannels = async (req, res) => {
    try {
        const { guildId } = req.query;
        if (!guildId)
            return api_formatter(req, res, 400, "missing guildId", "guildId is required", null, null, null);
        //check if the guildId is in req.quilds
        const guild = req.guilds.find(guild => guild.id === guildId);
        if (!guild)
            return api_formatter(req, res, 400, "unauthorised Server", "you are not admin of this guild or the bot is not present there", null, null, null);
        // use discordBot to get the text channels of the guild
        const allChannels = discordBot.guilds.cache.get(guildId).channels.cache;
        const textChannels = allChannels.filter(channel => channel.type === 0);
        const channelsList = textChannels.map(channel => ({
            id: channel.id,
            name: channel.name,
        }));
        return api_formatter(req, res, 200, "success", "list of text channel of this server got with success", channelsList, null, null); // return the user informations
    } catch (err) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord server", null, err, null);
    }
};

exports.getPullRequests = async (req, res) => {
    try {
        const token = req.user.github_token.access_token;
        if (!token)
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in using github", null, null, null);
        const prsResponse = await axios.get(
            "https://api.github.com/search/issues?q=type:pr+author:@me",
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return api_formatter(req, res, 200, "success", "your github pull requests have been fetched with success", prsResponse.data, null, null); // return the user informations
    } catch (error) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the github pull requests", null, error, null);
    }
};

exports.getMyRepos = async (req, res) => {
    try {
        const token = req.user.github_token.access_token;
        if (!token)
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in using github", null, null, null);
        const reposResponse = await axios.get(
            "https://api.github.com/user/repos",
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return api_formatter(req, res, 200, "success", "your github repository have been fetched with success", reposResponse.data, null, null); // return the user informations
    } catch (error) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the github repositories", null, error, null);
    }
};