const actionReaction = require("./actionReaction.js");
const checkAuthenticated = require("../../middleware/auth.js");

module.exports = function (app) {

    app.post("/area", checkAuthenticated, actionReaction.postArea);
    app.get("/area", checkAuthenticated, actionReaction.getArea);
    app.delete("/area", checkAuthenticated, actionReaction.deleteArea);
    app.patch("/area", checkAuthenticated, actionReaction.patchArea);

    app.get("/rawdataarea", checkAuthenticated, actionReaction.getRawDataArea);
    app.post("/activeAreas", checkAuthenticated, actionReaction.postActiveArea);
};
