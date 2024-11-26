const api_interactions = require("./api.js");
const checkAuthenticated = require("../../middleware/auth.js");

module.exports = function (app) {
    app.get("/profile_info", checkAuthenticated, api_interactions.profile);
};