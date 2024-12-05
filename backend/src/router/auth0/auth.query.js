const authInteractions = require("./auth.js");
const checkAuthenticated = require("../../middleware/auth.js");

module.exports = function (app) {
    app.post("/auth/google", checkAuthenticated, authInteractions.googleAuth);

    app.post("/auth/callback/discord", authInteractions.discordCallback);
    app.post("/auth/refresh/discord", authInteractions.discordRefresh);
}
