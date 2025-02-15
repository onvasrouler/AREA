const api_interactions = require("./api.js");
const checkAuthenticated = require("../../middleware/auth.js");
const discordGuilds = require("../../middleware/discord-guilds.js");
const discordUser = require("../../middleware/discord-auth.js");
const getCachedData = require("../../middleware/get-cached-data.js");

module.exports = function (app) {
    app.get("/profile_info", checkAuthenticated, api_interactions.profile);
    app.get("/invite_discord_bot", api_interactions.inviteDiscordBot);

    app.get("/get_my_discord_server", checkAuthenticated, getCachedData, discordGuilds, api_interactions.getDiscordServer);
    app.get("/get_my_user_id", checkAuthenticated, getCachedData, discordUser, api_interactions.getMyUserId);
    app.get("/get_list_of_channels", checkAuthenticated, getCachedData, discordGuilds, api_interactions.getListOfChannels);

    app.get("/discord_manager", api_interactions.manage_discord);
    app.get("/twitch_manager", api_interactions.manage_twitch);

    app.get("/get_pull_requests", checkAuthenticated, getCachedData, api_interactions.getPullRequests);
    app.get("/get_my_repos", checkAuthenticated, getCachedData, api_interactions.getMyRepos);

    app.get("/get_my_liked_tracks", checkAuthenticated, getCachedData, api_interactions.getMyLikedTracks);
    app.get("/get_currently_playing", checkAuthenticated, getCachedData, api_interactions.getCurrentlyPlaying);
};