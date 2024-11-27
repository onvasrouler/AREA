const useractions = require("./user.js");
const checkAuthenticated = require("../../middleware/auth.js");

module.exports = function (app) {
    app.post("/fastregister", useractions.fastregister);

    app.post("/register", useractions.register);
    app.post("/register/verify", useractions.verifyregister);

    app.post("/login", useractions.login);

    app.post("/auth/google", useractions.googleAuth);

    app.post("/logout", checkAuthenticated, useractions.logout);
    app.post("/logouteverywhere", checkAuthenticated, useractions.logouteverywhere);

    app.delete("/fastprofile", checkAuthenticated, useractions.deletefastprofile);

    app.delete("/profile", checkAuthenticated, useractions.deleteaccount);
    app.delete("/profile/confirm", checkAuthenticated, useractions.confirmdeleteaccount);

    app.post("/profile_picture", checkAuthenticated, useractions.profilepicture);
    app.get("/profile_picture", checkAuthenticated, useractions.getprofilepicture);
    app.delete("/profile_picture", checkAuthenticated, useractions.deleteprofilepicture);

    app.get("/sessions", checkAuthenticated, useractions.getsessions);
    app.delete("/sessions", checkAuthenticated, useractions.deletesessions);

    app.post("/forgotpassword", useractions.forgotpassword);
    app.post("/resetpassword", useractions.resetpassword);


};