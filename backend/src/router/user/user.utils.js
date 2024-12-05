const jwt = require("jsonwebtoken");
const api_formatter = require("../../middleware/api-formatter.js");
const UserModel = require("../../database/models/users");
const SessionModel = require("../../database/models/session");
const nodemailer = require("nodemailer");
const GoogleUsersModel = require("../../database/models/googleUsers");

// This function will return the signed cookies
async function return_signed_cookies(req, res, Session, User) {
    try {
        return api_formatter(
            req,
            res,
            200,
            "success",
            "successfully registered",
            null,
            null,
            jwt.sign({ session_id: Session.unique_session_id }, process.env.SECRET),
            User.username
        );
    } catch (err) {
        console.error(err);
        await reset_user_session(Session, User ? User : null);
        return api_formatter(
            req,
            res,
            500,
            "errorOccured",
            "An error occured while trying to get the auth token",
            null,
            err,
            null,
            null
        );
    }
}

// This function will check if the json data is correct
async function check_json_data(json_data) {
    return (Object.values(json_data).includes(undefined) || Object.values(json_data).includes(""));
}

// This function will reset the user session
async function reset_user_session(Session, User = null) {
    if (User)
        await User.updateOne({
            $pull: {
                link_session_id: Session ? Session.signed_id : null
            }
        }).catch(function (err) {
            console.error(err);
        });
    if (Session)
        return await SessionModel.deleteOne(
            { unique_session_id: Session ? Session.unique_session_id : null }
        ).catch(function (err) {
            console.error(err);
        });
    return null;
}

// This function will delete every user session
async function delete_every_user_session(User) {
    try {
        await User.updateOne({
            link_session_id: []
        }).catch(function (err) {
            console.error(err);
        });
        return await SessionModel.deleteMany(
            { user_signed_id: User ? User.unique_id : null });
    } catch (err) {
        console.error(err);
    }
}

// This function will delete a Google account
async function delete_google_account(User) {
    delete_every_user_session(User);
    return await GoogleUsersModel.deleteOne({
        _id: User ? User._id : null
    }).catch(function (err) {
        console.error(err);
    });
}

// This function will delete the user account
async function delete_user_account(User) {
    delete_every_user_session(User);
    return await UserModel.deleteOne({
        _id: User ? User._id : null
    }).catch(function (err) {
        console.error(err);
    });
}

console.log("Emailer email:", process.env.EMAILER_EMAIL);
console.log("Emailer password:", process.env.EMAILER_PASSWORD);

// This is the transporter for sending emails
const mailSender = nodemailer.createTransport({
    service: "yahoo",
    auth: {
        user: process.env.EMAILER_EMAIL,
        pass: process.env.EMAILER_PASSWORD,
    },
});

// This function will send an email
async function sendEmail({ to, subject, html }) {
    try {
        await mailSender.sendMail({
            from: process.env.EMAILER_EMAIL, // Sender address
            to, // List of receivers
            subject, // Subject line
            html, // HTML body
        });
        console.log("Email sent successfully.");
    } catch (err) {
        console.error("Error while sending email:", err);
        throw err;
    }
}

module.exports = {
    return_signed_cookies,
    check_json_data,
    reset_user_session,
    delete_every_user_session,
    delete_user_account,
    delete_google_account,
    sendEmail, // Export the email sending function
};