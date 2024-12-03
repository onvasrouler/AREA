const api_formatter = require("../../middleware/api-formatter.js");

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