const CachedDataModel = require("../database/models/cachedData.js")
const crypto = require("crypto");

async function CachedData(req, res, next) {
    try {
        req.cachedData = null;

        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error

        await CachedDataModel.findOne({ // this will find the cached data in the database
            user_signed_id: req.user.unique_id
        }).then(async function (CorrespondingData) {
            if (!CorrespondingData) {
                await new CachedDataModel({
                    unique_id: crypto.randomBytes(32).toString("hex"),
                    user_signed_id: req.user.unique_id,
                    createdAt: Date.now()
                }).save().then(async function (newCache) {
                    req.cachedData = newCache
                    return next()
                }).catch(function (err) {
                    return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to create a new cache for the user", null, err, null, null);
                })
            } else {
                req.cachedData = CorrespondingData
                return next();

            }
        }).catch(function (err) {
            return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to get the user cache", null, err, null, null);
        })
    } catch (err) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the user's cached data", null, err, null);
    }
}

module.exports = CachedData;