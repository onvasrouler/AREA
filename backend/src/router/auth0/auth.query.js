const discordInteraction = require("./discord/discordAuth.js");
const githubInteraction = require("./github/githubAuth.js");
const spotifyInteraction = require("./spotify/spotifyAuth.js");
const twitchInteraction = require("./twitch/twitchAuth.js");
const checkAuthenticated = require("../../middleware/auth.js");

module.exports = function (app) {

    app.post("/auth/callback/discord", checkAuthenticated, discordInteraction.discordCallback);
    app.post("/auth/refresh/discord", checkAuthenticated, discordInteraction.discordRefresh);
    app.post("/logout/discord", checkAuthenticated, discordInteraction.logoutDiscord);

    app.post("/mobileauth/callback/discord", checkAuthenticated, discordInteraction.discordCallbackMobile);

    app.post("/auth/callback/github", checkAuthenticated, githubInteraction.githubCallback);
    app.post("/auth/refresh/github", checkAuthenticated, githubInteraction.githubRefresh);
    app.post("/logout/github", checkAuthenticated, githubInteraction.logoutGithub);

    app.post("/auth/callback/spotify", checkAuthenticated, spotifyInteraction.spotifyCallback);
    app.post("/auth/refresh/spotify", checkAuthenticated, spotifyInteraction.spotifyRefresh);
    app.post("/logout/spotify", checkAuthenticated, spotifyInteraction.logoutSpotify);

    app.post("/mobileauth/callback/spotify", checkAuthenticated, spotifyInteraction.spotifyCallbackMobile);

    app.post("/auth/callback/twitch", checkAuthenticated, twitchInteraction.twitchCallback);
    app.post("/auth/refresh/twitch", checkAuthenticated, twitchInteraction.twitchRefresh);

    app.post("/mobileauth/callback/twitch", checkAuthenticated, twitchInteraction.twitchCallbackMobile);

};
