const UserModel = require("../../database/models/users");
const SessionModel = require("../../database/models/session");
const TokenModel = require("../../database/models/token");
const api_formatter = require("../../middleware/api-formatter.js");
const { OAuth2Client } = require("google-auth-library");
const GoogleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const { return_signed_cookies,
    check_json_data,
    reset_user_session,
    delete_every_user_session,
    delete_user_account,
    sendEmail } = require("./user.utils");

var hour = 3600000;
var day = hour * 24;
var month = day * 30;

const createToken = async (userId, type, expiresInMinutes) => {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    await TokenModel.deleteMany({ userId, type });
    await new TokenModel({
        userId,
        token: hashedToken,
        expiresAt: Date.now() + expiresInMinutes * 60 * 1000,
        type
    }).save();
    return token;
};

exports.fastregister = async (req, res) => {
    if (req.user && req.user != null) // if the user is already logged in
        return api_formatter(req, res, 401, "unauthorised", "You can't register when logged in"); // return an error message
    var tmpUserRegister = null; // this will be used to store the user that was registered
    try {
        const register_data = { // put the data in a variable to avoid repeating the same code
            "email": req.body.email,
            "password": req.body.password,
            "username": req.body.username,
            "ip": req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        };
        if (await check_json_data(register_data)) // check if one data is missing
            return api_formatter(req, res, 400, "missing_informations", "some of the information were not provided", null, null, null); // return an error message
        if (await UserModel.emailExists(register_data.email)) // check if the email already exist
            return api_formatter(req, res, 400, "email_already_exist", "an account with the provided email already exist", null, null, null); // return an error message
        if (await UserModel.usernameExists(register_data.username)) // check if the username already exist
            return api_formatter(req, res, 400, "username_already_exist", "an account with the provided username already exist", null, null, null); // return an error message

        await new UserModel({ // create a new user
            unique_id: crypto.randomUUID(),
            email: register_data.email,
            username: register_data.username,
            password: register_data.password,
            creationIp: register_data.ip,
            emailVerified: true
        }).save().then(async function (userRegistered) {
            tmpUserRegister = userRegistered; // set the user that was registered

            await new SessionModel({
                unique_session_id: crypto.randomUUID(), // set the unique session id
                signed_id: crypto.randomUUID(), // set the signed id
                user_signed_id: userRegistered.unique_id, // link it with the user id
                connexionIp: register_data.ip, // set the IP
                session_type: "default", // set the session type
                user_agent: req.headers["user-agent"], // set the user agent
                expire: Date.now() + month, // set the expiration date
            }).save().then(async function (sessionRegistered) { // if the session is created
                await userRegistered.updateOne({ // update the user
                    $addToSet: {
                        link_session_id: sessionRegistered.signed_id
                    }
                });
                return return_signed_cookies(req, res, sessionRegistered, userRegistered); // return the signed cookies
            }).catch(async (err) => { // if an error occured while creating the session
                console.error(err);
                return api_formatter(req, res, 500, "error", "Error while creating session", null, err, null);
            });
        }).catch(async (err) => { // if an error occured while registering
            console.error(err);
            await delete_user_account(tmpUserRegister); // delete the user account
            return api_formatter(req, res, 500, "error", "Error while registering", null, err, null);
        });
    } catch (err) { // if an error occured while trying to register
        console.error(err);
        await delete_user_account(tmpUserRegister);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to register", null, err, null);
    }
};

// Register a new user
exports.register = async (req, res) => {
    if (req.user && req.user != null)
        return api_formatter(req, res, 401, "unauthorised", "You can't register when logged in");

    try {
        const register_data = {
            "email": req.body.email,
            "password": req.body.password,
            "username": req.body.username,
            "ip": req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        }; // put the data in a variable to avoid repeating the same code
        if (await check_json_data(register_data)) return api_formatter(req, res, 400, "missing_informations", "some of the information were not provided", null, null, null); // check if one data is missing
        if (await UserModel.emailExists(register_data.email)) return api_formatter(req, res, 400, "email_already_exist", "an account with the provided email already exist", null, null, null); // check if the email already exist
        if (await UserModel.usernameExists(register_data.username)) return api_formatter(req, res, 400, "username_already_exist", "an account with the provided username already exist", null, null, null); // check if the username already exist

        await new UserModel({ // create a new user
            unique_id: crypto.randomUUID(),
            email: register_data.email,
            username: register_data.username,
            password: register_data.password,
            creationIp: register_data.ip
        }).save().then(async (savedUser) => { // if the user is created
            const confirmationToken = await createToken(savedUser.unique_id, "emailVerification", 15); // create the email verification token

            const mailContent = `<p>Thank you for registering on our platform.</p>
            <p>Please enter the following token in the dialog to confirm your registration:</p>
            <a href="${confirmationToken}" target="_blank">${confirmationToken}</a>\n\n
            <p>If you did not register, please ignore this email.</p>`; // create the mail content

            await sendEmail({ // send the email
                to: savedUser.email,
                subject: "Email Verification",
                html: mailContent
            })
                .then(() => { // if the email is sent
                    return api_formatter(req, res, 200, "success", "email sent successfully, check your spam folder", null, null, null); // return a success message
                }).catch(async (err) => {
                    console.error(err);
                    await UserModel.deleteOne({ unique_id: savedUser.unique_id }); // delete the user
                    return api_formatter(req, res, 500, "error", "Error while sending email", null, err, null); // return an error message
                });

        }).catch((err) => {
            console.error(err);
            return api_formatter(req, res, 500, "error", "Error while registering", null, err, null);
        });
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to register", null, err, null);
    }
};

// Verify the user's email after registration
exports.verifyregister = async (req, res) => {
    try {
        var tmpUserRegister = null; // this will be used to store the user that was registered
        const { token } = req.body; // get the token from the body
        if (!token) // if the token is not provided
            return api_formatter(req, res, 400, "missing_informations", "no token was provided", null, null, null); // return an error message

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex"); // hash the token
        const emailVerificationToken = await TokenModel.findOne({ // find the token in the database
            token: hashedToken, // search for the hashed token
            expiresAt: { $gt: Date.now() }, // check if the token is not expired
            type: "emailVerification"
        });

        if (!emailVerificationToken) // if the token is not found
            return api_formatter(req, res, 404, "notfound", "the provided token doesn't exist or is expired", null, null, null); // return an error message

        const user = await UserModel.findOne({ unique_id: emailVerificationToken.userId }); // find the user in the database
        if (!user) // if the user is not found
            return api_formatter(req, res, 404, "notfound", "no user found with the provided token", null, null, null); // return an error message

        user.emailVerified = true; // set the emailVerified field to true
        await user.save().then(async function (userRegistered) { // save the user
            await emailVerificationToken.deleteOne(); // delete the token
            tmpUserRegister = userRegistered; // set the user that was registered

            await new SessionModel({ // create a new session
                unique_session_id: crypto.randomUUID(), // set the unique session id
                signed_id: crypto.randomUUID(), // set the signed id
                user_signed_id: userRegistered.unique_id, // link it with the user id
                connexionIp: req.headers["x-forwarded-for"] || req.connection.remoteAddress, // set the IP
                session_type: "default", // set the session type
                user_agent: req.headers["user-agent"], // set the user agent
                expire: Date.now() + month,
            }).save().then(async function (sessionRegistered) {
                await userRegistered.updateOne({ // update the user
                    $addToSet: {
                        link_session_id: sessionRegistered.signed_id // add the session id to the link_session_id field
                    }
                });
                return return_signed_cookies(req, res, sessionRegistered, userRegistered); // return the signed cookies
            }).catch(async (err) => { // if an error occured while creating the session
                console.error(err);
                return api_formatter(req, res, 500, "error", "Error while creating session", null, err, null);
            });
        }).catch(async (err) => { // if an error occured while saving the user
            console.error(err);
            await delete_user_account(tmpUserRegister); // delete the user account
            return api_formatter(req, res, 500, "error", "Error while activating the account", null, err, null);
        });

    } catch (err) { // if an error occured while verifying the email
        console.error(err);
        await delete_user_account(tmpUserRegister);
        return api_formatter(req, res, 500, "error", "Error while verifying email", null, err, null);
    }
};

exports.login = async (req, res) => {
    if (req.user && req.user != null) // if the user is already logged in
        return api_formatter(req, res, 401, "unauthorised", "You can't log in when logged in");

    var tmpSessuion = null;
    try {
        const login_data = {
            "emailOrUsername": req.body.emailOrUsername,
            "password": req.body.password,
            "ip": req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        }; // put the data in a variable to avoid repeating the same code
        if (await check_json_data(login_data)) // check if one data is missing
            return api_formatter(req, res, 400, "missing_informations", "some of the information were not provided"); // return an error message


        await UserModel.findOne({ // find the user in the database
            $or: [
                {
                    email: login_data.emailOrUsername
                }, {
                    username: login_data.emailOrUsername
                }]
        }).then(async function (userToLogin) {
            if (!userToLogin)
                return api_formatter(req, res, 401, "user_not_found", "no user found with the provided email or username");
            if (userToLogin.accountType == "google")
                return api_formatter(req, res, 401, "google_account", "this account is a google account");
            if (!userToLogin.emailVerified)
                return api_formatter(req, res, 401, "email_not_verified", "the email is not verified for this account");
            if (await !userToLogin.comparePassword(login_data.password))
                return api_formatter(req, res, 401, "incorrect_password", "the provided password is incorrect for this account");

            await new SessionModel({ // create a new session
                unique_session_id: crypto.randomUUID(),
                signed_id: crypto.randomUUID(),
                user_signed_id: userToLogin.unique_id,
                connexionIp: login_data.ip,
                expire: Date.now() + month,
                user_agent: req.headers["user-agent"],
                session_type: "default",
            }).save().then(async function (newSession) { // if the session is created
                tmpSessuion = newSession;
                await userToLogin.updateOne({ // update the user
                    $addToSet: {
                        link_session_id: newSession.signed_id
                    }
                });
                return return_signed_cookies(req, res, newSession, userToLogin, "login successful"); // return the signed cookies
            }).catch(async (err) => { // if an error occured while creating the session
                console.error(err);
                return api_formatter(req, res, 500, "error", "Error while creating session", null, err, null);
            });
        }).catch(async (err) => { // if an error occured while finding the user
            console.error(err);
            return api_formatter(req, res, 500, "error", "Error while trying to login", null, err, null);
        });
    } catch (err) { // if an error occured while trying to login
        console.error(err);
        await reset_user_session(tmpSessuion);
        return api_formatter(req, res, 500, "error", "Error while trying to login", null, err, null);
    }
};

exports.googleAuth = async (req, res) => {
    if (req.user && req.user != null) // if the user is already logged in
        return api_formatter(req, res, 401, "unauthorised", "You can't register when logged in");

    var tmpUserRegister = null;  // this will be used to store the user that was registered
    const { token } = req.body; // get the token from the body
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // get the IP
    try {
        const ticket = await GoogleClient.verifyIdToken({ // verify the token
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload(); // get the payload
        let { sub: googleId, email, name, picture } = payload; // get the google id, email, name and picture

        // Check if the user exists in the database
        let googleUser = await UserModel.findOne({ google_id: googleId }); // find the user in the database

        if (!googleUser) { // if the user is not found create a new user
            if (await UserModel.usernameExists(name)) // check if the email already exist
                name = name + crypto.randomBytes(2).toString("hex"); // add a random string to the username
            googleUser = new UserModel({
                google_id: googleId,
                email: email,
                username: name,
                profilePicture: picture,
                creationIp: ip,
                unique_id: crypto.randomUUID(),
                emailVerified: true,
                accountType: "google"
            });
            await googleUser.save().then(async function (userRegistered) { // if the user is created successfully
                tmpUserRegister = userRegistered;
                await new SessionModel({ // create a new session
                    unique_session_id: crypto.randomUUID(),
                    signed_id: crypto.randomUUID(),
                    user_signed_id: userRegistered.unique_id,
                    connexionIp: userRegistered.ip,
                    session_type: "google",
                    user_agent: req.headers["user-agent"],
                    expire: Date.now() + month,
                }).save().then(async function (sessionRegistered) { // if the session is created
                    await userRegistered.updateOne({
                        $addToSet: {
                            link_session_id: sessionRegistered.signed_id // add the session id to the link_session_id field
                        }
                    });
                    return return_signed_cookies(req, res, sessionRegistered, userRegistered, "registration successful");
                });
            });
        } else { // if the user is found
            await new SessionModel({ // create a new session
                unique_session_id: crypto.randomUUID(),
                signed_id: crypto.randomUUID(),
                user_signed_id: googleUser.unique_id,
                connexionIp: ip,
                session_type: "google",
                expire: Date.now() + month,
            }).save().then(async function (sessionRegistered) { // if the session is created
                await googleUser.updateOne({
                    $addToSet: {
                        link_session_id: sessionRegistered.signed_id // add the session id to the link_session_id field
                    }
                });
                return return_signed_cookies(req, res, sessionRegistered, googleUser, "registration successful"); // return the signed cookies
            });
        }
    } catch (err) { // if an error occured while trying to register
        console.error(err);
        await delete_user_account(tmpUserRegister);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to register", null, err);
    }
};

exports.logout = async (req, res) => {
    try {
        if (req.user && req.user != null && req.user != undefined) // if the user is logged in
            await reset_user_session(req.session, req.user); // reset the user session
        return api_formatter(req, res, 200, "success", "logout successful", null, null, null); // return a success message
    } catch (err) {
        console.error(err); // if an error occured
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to logout", null, err, null);
    }
};

exports.logouteverywhere = async (req, res) => {
    try {
        if (req.user && req.user != null && req.user != undefined) // if the user is logged in
            delete_every_user_session(req.user); // delete all the user sessions
        return api_formatter(req, res, 200, "success", "you logged out everywhere successful", null, null, null); // return a success message
    } catch (err) {
        console.error(err); // if an error occured
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to logout everywhere", null, err, null);
    }
};

exports.deletefastprofile = async (req, res) => {
    try {
        if (!req.user || req.user == null)
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null);
        const givenPassword = req.body.password;
        if (!givenPassword)
            return api_formatter(req, res, 401, "noPassword", "you didn't provide any password", null, null, null);
        try {
            if (!req.user.comparePassword(req.body.password))
                return api_formatter(req, res, 401, "incorrect_password", "the provided password is incorrect for this account", null, null, null);
            await SessionModel.deleteMany({ user_signed_id: req.user.unique_id });
            await UserModel.deleteOne({ _id: req.user._id });
            return api_formatter(req, res, 200, "success", "account deleted successfully", null, null, null);
        } catch (err) {
            console.error(err);
            return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to delete the account", null, err, null);
        }
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to delete the account", null, err, null);
    }
};

exports.deleteaccount = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return an error message

        if (req.user.accountType == "google") {
            await delete_user_account(req.user); // delete the user account
            return api_formatter(req, res, 200, "success", "account deleted successfully", null, null, null); // return a success message
        }

        const givenPassword = req.body.password;
        if (!givenPassword) // if the password is not provided
            return api_formatter(req, res, 401, "noPassword", "you didn't provide any password", null, null, null); // return an error message

        if (!req.user.comparePassword(req.body.password)) // if the password is incorrect
            return api_formatter(req, res, 401, "incorrect_password", "the provided password is incorrect for this account", null, null, null); // return an error message

        const deleteAccountToken = await createToken(req.user.unique_id, "deleteAccount", 15); // use req.user.unique_id

        const mailContent = `<p>You are receiving this because you (or someone else) have requested the deletion of your account.</p>
            <p>copy past the following caracters in the text box on the website or application:</p>
            <h2>${deleteAccountToken}</h2>\n\n
            <p>If you did not request this, please ignore this email and your account will remain unchanged.</p>`; // create the mail content

        await sendEmail({ // send the email
            to: req.user.email,
            subject: "Account Deletion",
            html: mailContent
        }).then(() => { // if the email is sent
            return api_formatter(req, res, 200, "success", "email sent successfully, check your spam folder", null, null, null); // return a success message
        }).catch((err) => {
            console.error(err);
            return api_formatter(req, res, 500, "error", "Error while sending email", null, err, null); // return an error message
        });
    } catch (err) { // if an error occured while trying to delete the account
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to delete the account", null, err, null);
    }
};

exports.confirmdeleteaccount = async (req, res) => {
    try {
        const { token } = req.body; // get the token from the body
        if (!token) // if the token is not provided
            return api_formatter(req, res, 400, "missing_informations", "no token was provided", null, null, null); // return an error message

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex"); // hash the token
        const deleteAccountToken = await TokenModel.findOne({ // find the token in the database
            token: hashedToken,
            expiresAt: { $gt: Date.now() },
            type: "deleteAccount"
        });
        if (!deleteAccountToken) // if the token is not found
            return api_formatter(req, res, 404, "notfound", "the provided token doesn't exist or is expired", null, null, null); // return an error message

        let user = await UserModel.findOne({ unique_id: deleteAccountToken.userId }); // find the user in the database

        if (!user) // if the user is not found
            return api_formatter(req, res, 404, "notfound", "no user found with the provided token", null, null, null); // return an error message

        await delete_user_account(user); // delete the user account
        await TokenModel.deleteMany({ userId: user.unique_id }); // delete all the tokens of the user
        return api_formatter(req, res, 200, "success", "account deleted successfully", null, null, null); // return a success message
    } catch (err) { // if an error occured while trying to delete the account
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to delete the account", null, err, null);
    }
};

exports.profilepicture = async (req, res) => {
    try {
        if (!req.user || req.user == null) { // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null); // return an error message
        } else {
            if (!req.files || Object.keys(req.files).length === 0) // if no file is uploaded
                return api_formatter(req, res, 400, "nofile", "No files were uploaded.", null, null, null, req.user.username); // return an error message
            if (req.user.accountType == "google") // if the session type is google
                return api_formatter(req, res, 401, "unauthorised", "You can't set a profile picture with a google account", null, null, null, req.user.username); // return an error message

            const profilePicture = req.files.profilepicture; // get the profile picture
            const oldPath = req.user.profilePicture; // get the old path
            const fileExtension = path.extname(profilePicture.name); // get the file extension
            const uniqueFileName = `${req.user.unique_id}_${crypto.randomUUID()}${fileExtension}`; // create a unique file name

            if (!fs.existsSync(path.join(__dirname, "../../storage/")))
                fs.mkdirSync(path.join(__dirname, "../../storage/"));
            const uploadPath = path.join(__dirname, "../../storage/", req.user.unique_id + "_" + uniqueFileName); // create the upload path

            profilePicture.mv(uploadPath, function (err) { // move the file
                if (err) { // if an error occured while uploading the file
                    console.error(err);
                    return api_formatter(req, res, 500, "error", "Error while uploading file", null, err, null, req.user.username); // return an error message
                }

                if (oldPath != null && oldPath != uploadPath) // if there is an old path
                    fs.unlink(oldPath, (err) => { // delete the old file
                        if (err) { // if an error occured while deleting the old file
                            console.error(err);
                            console.error("error while deleting old file: " + err);
                        }
                    });

                req.user.profilePicture = uploadPath; // set the profile picture path
                req.user.save().then(() => { // save the user
                    return api_formatter(req, res, 200, "success", "File uploaded successfully", { fileName: uniqueFileName }, null, null, req.user.username); // return a success message
                }).catch((err) => { // if an error occured while saving the user
                    console.error(err);
                    return api_formatter(req, res, 500, "error", "Error while saving file path", null, err, null, req.user.username);
                });
            });
        }
    } catch (err) { // if an error occured while uploading the file
        console.error(err);
        return api_formatter(req, res, 500, "error", "Error while uploading file", null, err, null, req.user.username);
    }
};

exports.getprofilepicture = async (req, res) => {
    try {
        if (!req.user || req.user == null) { // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null); // return an error message
        } else {
            if (req.user.accountType == "google") // if the session type is google
                return res.send(req.user.profilePicture); // send the profile picture
            if (!req.user.profilePicture || req.user.profilePicture == null || req.user.profilePicture == "") // if the profile picture path is not found
                return api_formatter(req, res, 404, "notfound", "no profile picture found", null, null, null, req.user.username); // return an error message
            return res.sendFile(req.user.profilePicture); // send the profile picture
        }
    } catch (err) { // if an error occured while getting the file
        console.error(err);
        return api_formatter(req, res, 500, "error", "Error while getting file", null, err, null, req.user.username);
    }
};

exports.deleteprofilepicture = async (req, res) => {
    try {
        if (!req.user || req.user == null) { // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null); // return an error message
        } else {
            if (req.user.accountType == "google") // if the session type is google
                return api_formatter(req, res, 401, "unauthorised", "You can't delete a profile picture with a google account", null, null, null, req.user.username); // return an error message
            if (!req.user.profilePicture || req.user.profilePicture == null || req.user.profilePicture == "") // if the profile picture path is not found
                return api_formatter(req, res, 404, "notfound", "no profile picture found", null, null, null, req.user.username); // return an error message
            fs.unlink(req.user.profilePicture, (err) => { // delete the file
                if (err) {
                    console.error(err);
                    return api_formatter(req, res, 500, "error", "Error while deleting file", null, err, null, req.user.username); // return an error message
                }
                req.user.profilePicture = ""; // set the profile picture path to null
                req.user.save().then(() => { // save the user
                    return api_formatter(req, res, 200, "success", "File deleted successfully", null, null, null, req.user.username); // return a success message
                }).catch((err) => { // if an error occured while saving the user
                    console.error(err);
                    return api_formatter(req, res, 500, "error", "Error while saving file path", null, err, null, req.user.username); // return an error message
                });
            });
        }
    } catch (err) { // if an error occured while deleting the file
        console.error(err);
        return api_formatter(req, res, 500, "error", "Error while deleting file", null, err, null, req.user.username);
    }
};

exports.getsessions = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null); // return an error message

        const sessionList = await SessionModel.find({ user_signed_id: req.user.unique_id }); // find the sessions in the database
        if (!sessionList || sessionList.length == 0) // if no session is found
            return api_formatter(req, res, 404, "notfound", "no sessions found", null, null, null, req.user.username); // return an error message

        const formattedSessionList = []; // create a variable to store the formatted session list
        sessionList.forEach((session) => { // loop through the session list
            formattedSessionList.push({ // push the session to the formatted session list
                "session_id": session.unique_session_id,
                "session_type": session.session_type,
                "expire": session.expire,
                "user_agent": session.user_agent,
                "connexionIp": session.connexionIp
            });
        });

        return api_formatter(req, res, 200, "success", "sessions found", formattedSessionList, null, null, req.user.username); // return a success message
    } catch (err) { // if an error occured while getting the sessions
        console.error(err);
        return api_formatter(req, res, 500, "error", "Error while getting sessions", null, err, null, req.user.username); // return an error message
    }
};

exports.deletesessions = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null); // return an error message

        const sessionsIds = req.body.sessionsIds; // get the sessions ids
        if (!sessionsIds || sessionsIds.length == 0) // if no session id is provided
            return api_formatter(req, res, 400, "missing_informations", "no sessions ids were provided", null, null, null, req.user.username); // return an error message

        await SessionModel.deleteMany({ user_signed_id: req.user.unique_id, signed_id: { $in: sessionsIds } }); // delete the sessions
        return api_formatter(req, res, 200, "success", `${sessionsIds} deleted successfully`, null, null, null, req.user.username); // return a success message
    } catch (err) { // if an error occured while deleting the sessions
        console.error(err);
        return api_formatter(req, res, 500, "error", "Error while deleting sessions", null, err, null, req.user.username);
    }
};

exports.forgotpassword = async (req, res) => {
    try {
        const email = req.body.email; // get the email from the body
        if (!email) // if the email is not provided
            return api_formatter(req, res, 400, "missing_informations", "no email was provided", null, null, null); // return an error message

        const user = await UserModel.findOne({ email: email }); // find the user in the database
        if (!user) // if the user is not found
            return api_formatter(req, res, 404, "notfound", "no user found with the provided email", null, null, null); // return an error message
        if (user.accountType == "google") // if the account type is google
            return api_formatter(req, res, 401, "unauthorised", "You can't reset the password of a google account", null, null, null); // return an error message

        const resetToken = await createToken(user.unique_id, "passwordReset", 15);

        const mailContent = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>copy past the following caracters in the text box on the website or application:</p>
        <h2>${resetToken}</h2>\n\n
        <p>If you did not request this, please ignore this email and your account will remain unchanged.</p>`; // create the mail content


        await sendEmail({ // send the email
            to: user.email,
            subject: "Password Reset",
            html: mailContent
        })
            .then(() => { // if the email is sent
                return api_formatter(req, res, 200, "success", "email sent successfully, check your spam folder", null, null, null); // return a success message
            }).catch((err) => { // if an error occured while sending the email
                console.error(err);
                return api_formatter(req, res, 500, "error", "Error while sending email", null, err, null); // return an error message
            });
    } catch (err) { // if an error occured while trying to init the forgot password function
        console.error(err);
        return api_formatter(req, res, 500, "error", "Error while trying to init the forgot password function", null, err, null); // return an error message
    }
};

exports.resetpassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body; // get the reset token and the new password from the body
        if (!resetToken || !newPassword) // if the reset token or the new password is not provided
            return api_formatter(req, res, 400, "missing_informations", "missing reset token or password", null, null, null); // return an error message

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex"); // hash the token
        const passwordResetToken = await TokenModel.findOne({ // find the token in the database
            token: hashedToken,
            expiresAt: { $gt: Date.now() },
            type: "resetPassword"
        });

        if (!passwordResetToken) // if the token is not found
            return api_formatter(req, res, 404, "notfound", "the provided token doesn't exist or is expired", null, null, null); // return an error message

        const user = await UserModel.findOne({ unique_id: passwordResetToken.userId }); // find the user in the database
        if (!user) // if the user is not found
            return api_formatter(req, res, 404, "notfound", "no user found with the provided token", null, null, null); // return an error message

        user.oldPassword = user.password; // set the old password
        user.password = newPassword; // set the new password
        user.passwordChangedAt = Date.now(); // set the password changed at field

        await user.save().then(async () => { // save the user
            await passwordResetToken.deleteOne(); // delete the token
            return api_formatter(req, res, 200, "success", "password reset successfully", null, null, null); // return a success message
        }).catch((err) => { // if an error occured while saving the user
            console.error(err);
            return api_formatter(req, res, 500, "error", "Error while resetting password", null, err, null);  // return an error message
        });
    } catch (err) { // if an error occured while resetting the password
        console.error(err);
        return api_formatter(req, res, 500, "error", "Error while resetting password", null, err, null);
    }
};

exports.updateprofile = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null); // return an error message

        const updateData = req.body; // get the update data
        if (await check_json_data(updateData)) // check if one data is missing
            return api_formatter(req, res, 400, "missing_informations", "some of the information were not provided", null, null, null, req.user.username); // return an error message

        if (updateData.email && updateData.email != req.user.email) { // if the email is provided
            if (await UserModel.emailExists(updateData.email)) // check if the email already exist
                return api_formatter(req, res, 400, "email_already_exist", "an account with the provided email already exist", null, null, null, req.user.username); // return an error message
        }

        if (updateData.username && updateData.username != req.user.username) { // if the username is provided
            if (await UserModel.usernameExists(updateData.username)) // check if the username already exist
                return api_formatter(req, res, 400, "username_already_exist", "an account with the provided username already exist", null, null, null, req.user.username); // return an error message
        }

        await req.user.updateOne(updateData).then(() => { // update the user
            return api_formatter(req, res, 200, "success", "profile updated successfully", null, null, null, req.user.username); // return a success message
        }).catch((err) => { // if an error occured while updating the user
            console.error(err);
            return api_formatter(req, res, 500, "error", "Error while updating profile", null, err, null, req.user.username); // return an error message
        });
    } catch (err) { // if an error occured while updating the profile
        console.error(err);
        return api_formatter(req, res, 500, "error", "Error while updating profile", null, err, null, req.user.username); // return an error message
    }
};
