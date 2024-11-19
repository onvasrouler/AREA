const UserModel = require("../database/models/users.js");
const GoogleUsersModel = require("../database/models/googleUsers.js");
const SessionModel = require("../database/models/session.js");
const jwt = require("jsonwebtoken");
const sendApiData = require("./api-formatter.js");

async function checkAuthenticated(req, res, next) {
    try {
        const givenQuery = req.query.session;
        const givenHeader = req.headers.session;
        const GivenSession = givenQuery || givenHeader;

        if (!GivenSession || GivenSession == null || GivenSession == "null")
            return invalid_session(req, res);


        var decodedSession = null;
        req.user = null;
        req.session = null;
        
        try {
            decodedSession = await jwt.verify(GivenSession, process.env.SECRET);
        } catch (err) {
            console.error(err);
            decodedSession = null;
            throw err;
        }
        if (!decodedSession)
            return invalid_session(req, res);
        await SessionModel.findOne({
            unique_session_id: decodedSession.session_id
        }).then(async function (FoundSession) {
            if (!FoundSession)
                return invalid_session(req, res);
            if (FoundSession.session_type == "default") {
                await UserModel.findOne({
                    link_session_id: FoundSession.signed_id
                }).then(async function (CorrespondingUser) {
                    if (await verif_session_data(FoundSession, CorrespondingUser))
                        return invalid_session(req, res);
                    req.user = CorrespondingUser;
                    req.session = FoundSession;
                    return next();
                }).catch(function (err) {
                    console.error(err);
                    return invalid_session(req, res);
                });
            } else if (FoundSession.session_type == "google") {
                await GoogleUsersModel.findOne({
                    link_session_id: FoundSession.signed_id
                }).then(async function (CorrespondingUser) {
                    if (await verif_session_data(FoundSession, CorrespondingUser))
                        return invalid_session(req, res);
                    req.user = CorrespondingUser;
                    req.session = FoundSession;
                    return next();
                }).catch(function (err) {
                    console.error(err);
                    return invalid_session(req, res);
                });
            } else
                return invalid_session(req, res);
        }).catch(function (err) {
            console.error(err);
            return invalid_session(req, res);
        });
    } catch (err) {
        console.error(err);
        return sendApiData(req, res, 500, "errorOccured", "An error occured while trying to verify your session", null, err, null, null);
    }
}


async function verif_session_data(session, user) {
    return (session.expire == null || session.expire < Date.now() ||
        session.signed_id == null || !user.link_session_id.includes(session.signed_id) ||
        session.user_signed_id != user.unique_id);
}

function invalid_session(req, res) {
    req.user = null;
    req.session = null;
    return sendApiData(req, res, 401, "invalidSession", "It appears that your session is invalid", null, null, null, null);
    
}

module.exports = checkAuthenticated;