const api_interactions = require("./api.js");
const checkAuthenticated = require("../../middleware/auth.js");
const discordAuth = require("../../middleware/discord-auth.js");

module.exports = function (app) {
    app.get("/profile_info", checkAuthenticated, api_interactions.profile);
    app.get("/invite_discord_bot", api_interactions.inviteDiscordBot);

    app.get("/get_my_discord_server", checkAuthenticated, discordAuth, api_interactions.getDiscordServer);
    app.get("/get_list_of_channels", checkAuthenticated, discordAuth, api_interactions.getListOfChannels);

    app.get("/get_pull_requests", checkAuthenticated, api_interactions.getPullRequests);
    app.get("/get_my_repos", checkAuthenticated, api_interactions.getMyRepos);
    app.get("/discord_manager", api_interactions.manage_discord);
};