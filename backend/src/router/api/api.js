const api_formatter = require("../../middleware/api-formatter.js");
const axios = require('axios');
const discordBot = require('../../utils/discord');
const UserModel = require("../../database/models/users");

// This function will return the user profile
exports.profile = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error
        const user_infos = { // this will store the user informations
            "username": req.user.username,
            "email": req.user.email,
            "account_type": req.user.accountType,
        };
        return api_formatter(req, res, 200, "success", "you are authenticated", user_infos, null, null); // return the user informations
    } catch (err) { // if an error occured
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the user profile", null, err, null);
    }
};

exports.inviteDiscordBot = async (req, res) => {
    const discordClientId = discordBot.user.id;
    const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&permissions=8&scope=bot%20applications.commands`;
    return api_formatter(req, res, 200, "success", "discord invitation link getted with success", inviteLink, null, null); // return the user informations
}


// This function will return the discord server where the user is admin
exports.getDiscordServer = async (req, res) => {
    try {
        console.log(req.guilds);
        const matchingGuilds = req.guilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon
        }));
        return api_formatter(req, res, 200, "success", "you are authenticated", matchingGuilds, null, null); // return the user informations
    } catch (err) { // if an error occured
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord server", null, err, null);
    }
}

exports.getListOfChannels = async (req, res) => {
    try {
        const { guildId } = req.query;
        if (!guildId)
            return api_formatter(req, res, 400, "error", "guildId is required", null, null, null);
        //check if the guildId is in req.quilds
        const guild = req.guilds.find(guild => guild.id === guildId);
        if (!guild)
            return api_formatter(req, res, 400, "error", "you are not admin of this guild or the bot is not present there", null, null, null);
        // use discordBot to get the text channels of the guild
        const allChannels = discordBot.guilds.cache.get(guildId).channels.cache;
        const textChannels = allChannels.filter(channel => channel.type === 0);
        const channelsList = textChannels.map(channel => ({
            id: channel.id,
            name: channel.name,
        }));
        return api_formatter(req, res, 200, "success", "you are authenticated", channelsList, null, null); // return the user informations
    } catch (err) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord server", null, err, null);
    }
}
