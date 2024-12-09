const actionReaction = require("./actionReaction.js");
const checkAuthenticated = require("../../middleware/auth.js");

module.exports = function (app) {

    app.post("/area", checkAuthenticated, actionReaction.postArea);
    app.get("/area", checkAuthenticated, actionReaction.getArea);
    app.delete("/area", checkAuthenticated, actionReaction.deleteArea);
};
