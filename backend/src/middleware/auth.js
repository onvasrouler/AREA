const UserModel = require("../database/models/users.js");
const GoogleUsersModel = require("../database/models/googleUsers.js");
const SessionModel = require("../database/models/session.js");
const jwt = require("jsonwebtoken");
const sendApiData = require("./api-formatter.js");

async function checkAuthenticated(req, res, next) {
    try {
        const givenQuery = req.query.session; // this will get the session from the query
        const givenHeader = req.headers.session; // this will get the session from the headers
        const GivenSession = givenQuery || givenHeader; // this will get the session from the query or the headers depending on which one is available

        if (!GivenSession || GivenSession == null || GivenSession == "null") // this will check if the session is null
            return invalid_session(req, res);


        var decodedSession = null; // this will be used to store the decoded session
        req.user = null; // we reset the user
        req.session = null; // we reset the session

        try {
            decodedSession = await jwt.verify(GivenSession, process.env.SECRET); // this will verify the session
        } catch (err) { // if an error occured because the session is invalid
            decodedSession = null; // this will reset the decoded session
            throw err;
        }
        if (!decodedSession) // if the session is invalid
            return invalid_session(req, res);
        await SessionModel.findOne({ // this will find the session in the database
            unique_session_id: decodedSession.session_id
        }).then(async function (FoundSession) {
            if (!FoundSession) // if the session is not found
                return invalid_session(req, res);
            if (FoundSession.session_type == "default") { // if the session is a default session we will find the user in the model users
                await UserModel.findOne({
                    link_session_id: FoundSession.signed_id // this will find the user that has the session id in the link_session_id field
                }).then(async function (CorrespondingUser) {
                    if (await verif_session_data(FoundSession, CorrespondingUser)) // verify the session data to avoid security issues
                        return invalid_session(req, res);
                    req.user = CorrespondingUser; // this will set the user
                    req.session = FoundSession; // this will set the session
                    return next(); // we call the next middleware
                }).catch(function (err) {
                    console.error(err); // if an error occured
                    return invalid_session(req, res); // we return an invalid session
                });
            } else if (FoundSession.session_type == "google") { // if the session is a google session we will find the user in the model googleUsers
                await GoogleUsersModel.findOne({
                    link_session_id: FoundSession.signed_id // this will find the user that has the session id in the link_session_id field
                }).then(async function (CorrespondingUser) {
                    if (await verif_session_data(FoundSession, CorrespondingUser)) // verify the session data to avoid security issues
                        return invalid_session(req, res);
                    req.user = CorrespondingUser; // this will set the user
                    req.session = FoundSession; // this will set the session
                    return next(); // we call the next middleware
                }).catch(function (err) {
                    console.error(err); // if an error occured
                    return invalid_session(req, res); // we return an invalid session
                });
            } else
                return invalid_session(req, res); // if the session type is invalid
        }).catch(function (err) {
            console.error(err);
            return invalid_session(req, res); // if an while trying to find the session
        });
    } catch (err) {
        console.error(err);
        return sendApiData(req, res, 500, "errorOccured", "An error occured while trying to verify your session", null, err, null, null); // if an error occured
    }
}


async function verif_session_data(session, user) {
    return (session.expire == null || session.expire < Date.now() || // if the session is expired
        session.signed_id == null || !user.link_session_id.includes(session.signed_id) || // if the session is not linked to the user
        session.user_signed_id != user.unique_id); // if the session is not linked to the user
}

function invalid_session(req, res) {
    req.user = null; // we reset the user
    req.session = null; // we reset the session
    return sendApiData(req, res, 401, "invalidSession", "It appears that your session is invalid", null, null, null, null); // we return an invalid session

}

// we export the function
module.exports = checkAuthenticated;