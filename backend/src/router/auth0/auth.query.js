const authInteractions = require("./auth.js");
const checkAuthenticated = require("../../middleware/auth.js");

module.exports = function (app) {

    app.post("/auth/callback/discord", checkAuthenticated, authInteractions.discordCallback);
    app.post("/auth/refresh/discord", checkAuthenticated, authInteractions.discordRefresh);

    app.post("/auth/callback/github", checkAuthenticated, authInteractions.githubCallback);
    app.post("/auth/refresh/github", checkAuthenticated, authInteractions.githubRefresh);
};
