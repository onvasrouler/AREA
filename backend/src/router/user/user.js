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

/**
 * @swagger
 * /fastregister:
 *   post:
 *     summary: Register a new user quickly
 *     description: Register a new user with email, username, and password quickly ( means without sending an email for the verification ), this is useful for testing purposes.
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *               username:
 *                 type: string
 *                 description: The user's username.
 *                 example: username123
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: successfully registered 
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations / email_already_exist / username_already_exist
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: some of the information were not provided / an account with the provided email already exist / an account with the provided username already exist
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: unauthorised
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: You can't register when logged in 
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: Error while registering / Error while creating session / Error while trying to register
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
        return api_formatter(req, res, 500, "error", "An error occured while trying to register", null, err, null);
    }
};

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with email, username, and password.
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *               username:
 *                 type: string
 *                 description: The user's username.
 *                 example: username123
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: email sent successfully, check your spam folder 
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations / email_already_exist / username_already_exist
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: some of the information were not provided / an account with the provided email already exist / an account with the provided username already exist
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: unauthorised
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: You can't register when logged in 
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while sending email / An error occured Error while registering / An error occured while trying to register
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
                    return api_formatter(req, res, 500, "error", "An error occured while sending email", null, err, null); // return an error message
                });

        }).catch((err) => {
            console.error(err);
            return api_formatter(req, res, 500, "error", "An error occured while registering", null, err, null);
        });
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to register", null, err, null);
    }
};

/**
 * @swagger
 * /register/verify:
 *   post:
 *     summary: verify the registration of a new user
 *     description: verify the new user with a token sent to the email
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The user's email.
 *                 example: 123456789abcdefgh
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: successfully registered 
 *       404:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 404 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notfound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: the provided token doesn't exist or is expired / no user found with the provided token
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while creating session / An error occured while activating the account / An error occured while verifying email
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
                return api_formatter(req, res, 500, "error", "An error occured while creating session", null, err, null);
            });
        }).catch(async (err) => { // if an error occured while saving the user
            console.error(err);
            await delete_user_account(tmpUserRegister); // delete the user account
            return api_formatter(req, res, 500, "error", "An error occured while activating the account", null, err, null);
        });

    } catch (err) { // if an error occured while verifying the email
        console.error(err);
        await delete_user_account(tmpUserRegister);
        return api_formatter(req, res, 500, "error", "An error occured while verifying email", null, err, null);
    }
};

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     description: log in a user with email or username, and password
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *                 description: The user's email.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: successfully registered 
 *                data:
 *                 type: object
 *                 description: The data.
 *                 example: null 
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: null
 *                session:
 *                 type: string
 *                 description: The session token the user will use in his request to be autentificated.
 *                 example: 123456789abcdefgh
 *                username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: username123
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: some of the information were not provided
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: unauthorised / user_not_found / google_account / email_not_verified / incorrect_password
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: You can't register when logged in / no user found with the provided email or username / this account is a google account / the email is not verified for this account / the provided password is incorrect for this account
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while creating session / An error occured while trying to login
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
                return api_formatter(req, res, 500, "error", "An error occured while creating session", null, err, null);
            });
        }).catch(async (err) => { // if an error occured while finding the user
            console.error(err);
            return api_formatter(req, res, 500, "error", "An error occured while trying to login", null, err, null);
        });
    } catch (err) { // if an error occured while trying to login
        console.error(err);
        await reset_user_session(tmpSessuion);
        return api_formatter(req, res, 500, "error", "An error occured while trying to login", null, err, null);
    }
};

/**
 * @swagger
 * /googleAuth:
 *   post:
 *     summary: Authenticate a user using Google OAuth
 *     description: Authenticate a user using a Google OAuth token.
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The Google OAuth token.
 *                 example: ya29.a0AfH6SMC...
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: successfully registered 
 *                data:
 *                 type: object
 *                 description: The data.
 *                 example: null 
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: null
 *                session:
 *                 type: string
 *                 description: The session token the user will use in his request to be autentificated.
 *                 example: 123456789abcdefgh
 *                username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: username123
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no token was provided
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: unauthorised
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: You can't register when logged in
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while trying to register
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.googleAuth = async (req, res) => {
    if (req.user && req.user != null) // if the user is already logged in
        return api_formatter(req, res, 401, "unauthorised", "You can't register when logged in");

    var tmpUserRegister = null;  // this will be used to store the user that was registered
    const { token } = req.body; // get the token from the body
    if (!token) // if the token is not provided
        return api_formatter(req, res, 400, "missing_informations", "no token was provided"); // return an error message
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
        return api_formatter(req, res, 500, "error", "An error occured while trying to register", null, err);
    }
};

/**
 * @swagger
 * /googleMobileAuth:
 *   post:
 *     summary: Authenticate a user using Google OAuth
 *     description: Authenticate a user using a Google OAuth access token.
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The Google OAuth access token.
 *                 example: ya29.a0AfH6SMC...
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: successfully registered 
 *                data:
 *                 type: object
 *                 description: The data.
 *                 example: null 
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: null
 *                session:
 *                 type: string
 *                 description: The session token the user will use in his request to be autentificated.
 *                 example: 123456789abcdefgh
 *                username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: username123
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no token was provided
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: unauthorised
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: You can't register when logged in
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while trying to register
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.googleMobileAuth = async (req, res) => {
    if (req.user && req.user != null) // if the user is already logged in
        return api_formatter(req, res, 401, "unauthorised", "You can't register when logged in");

    var tmpUserRegister = null;  // this will be used to store the user that was registered
    const { token } = req.body; // get the token from the body
    if (!token) // if the token is not provided
        return api_formatter(req, res, 400, "missing_informations", "no token was provided"); // return an error message
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // get the IP
    try {
        const endpoint = "https://www.googleapis.com/oauth2/v3/userinfo";

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const payload = await response.json();

        // Extraire les informations nécessaires
        var { sub: googleId, email, name, picture } = payload;


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
        return api_formatter(req, res, 500, "error", "An error occured while trying to register", null, err);
    }
};

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout a user
 *     description: Logout a user by deleting the session.
 *     tags:
 *      - user
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: logout successful
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while trying to logout
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.logout = async (req, res) => {
    try {
        if (req.user && req.user != null && req.user != undefined) // if the user is logged in
            await reset_user_session(req.session, req.user); // reset the user session
        return api_formatter(req, res, 200, "success", "logout successful", null, null, null); // return a success message
    } catch (err) {
        console.error(err); // if an error occured
        return api_formatter(req, res, 500, "error", "An error occured while trying to logout", null, err, null);
    }
};

/**
 * @swagger
 * /logouteverywhere:
 *   post:
 *     summary: Logout a user everywhere
 *     description: Logout a user by deleting all the sessions.
 *     tags:
 *      - user
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you logged out everywhere successfully
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while trying to logout everywhere
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.logouteverywhere = async (req, res) => {
    try {
        if (req.user && req.user != null && req.user != undefined) // if the user is logged in
            delete_every_user_session(req.user); // delete all the user sessions
        return api_formatter(req, res, 200, "success", "you logged out everywhere successfully", null, null, null); // return a success message
    } catch (err) {
        console.error(err); // if an error occured
        return api_formatter(req, res, 500, "error", "An error occured while trying to logout everywhere", null, err, null);
    }
};

/**
 * @swagger
 * /deletefastprofile:
 *   delete:
 *     summary: Delete a user's fast profile
 *     description: Delete a user's fast profile by providing the password.
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: account deleted successfully
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notloggedin / noPassword / incorrect_password
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not logged in / you didn't provide any password / the provided password is incorrect for this account
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while trying to delete the account
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
            return api_formatter(req, res, 500, "error", "An error occured while trying to delete the account", null, err, null);
        }
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to delete the account", null, err, null);
    }
};

/**
 * @swagger
 * /profile:
 *   delete:
 *     summary: Delete a user's account
 *     description: Delete a user's account by providing the password if the account is not a Google account.
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message, if the account is a google account it will delete it immediatly otherwise it will send a verification email.
 *                 example: account deleted successfully / email sent successfully, check your spam folder
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notloggedin / noPassword / incorrect_password
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not logged in / you didn't provide any password / the provided password is incorrect for this account
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while trying to delete the account
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
            return api_formatter(req, res, 500, "error", "An error occured while sending email", null, err, null); // return an error message
        });
    } catch (err) { // if an error occured while trying to delete the account
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to delete the account", null, err, null);
    }
};

/**
 * @swagger
 * /profile/confirm:
 *   delete:
 *     summary: Confirm deletion of a user's account
 *     description: Confirm the deletion of a user's account by providing a valid token.
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The token for confirming account deletion.
 *                 example: someRandomToken123
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: account deleted successfully
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no token was provided
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notloggedin
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not logged in
 *       404:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 404 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notfound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: the provided token doesn't exist or is expired
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while trying to delete the account
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.confirmdeleteaccount = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return an error message

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
        return api_formatter(req, res, 500, "error", "An error occured while trying to delete the account", null, err, null);
    }
};

/**
 * @swagger
 * /profile_picture:
 *   post:
 *     summary: Upload a user's profile picture
 *     description: Upload a new profile picture for the user.
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The profile picture file to upload.
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: profile picture uploaded successfully
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: nofile
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no file was provided
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notloggedin / unauthorised
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not logged in / You can't set a profile picture with a google account
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while uploading file / An error occured while saving file path
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.profilepicture = async (req, res) => {
    try {
        if (!req.user || req.user == null) { // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null); // return an error message
        } else {
            if (!req.files || Object.keys(req.files).length === 0) // if no file is uploaded
                return api_formatter(req, res, 400, "nofile", "no file was provided.", null, null, null, req.user.username); // return an error message
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
                    return api_formatter(req, res, 500, "error", "An error occured while uploading file", null, err, null, req.user.username); // return an error message
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
                    return api_formatter(req, res, 500, "error", "An error occured while saving file path", null, err, null, req.user.username);
                });
            });
        }
    } catch (err) { // if an error occured while uploading the file
        console.error(err);
        return api_formatter(req, res, 500, "error", "Error while uploading file", null, err, null, req.user.username);
    }
};

/**
 * @swagger
 * /profile_picture:
 *   get:
 *     summary: Get a user's profile picture
 *     description: Retrieve the profile picture of the user.
 *     tags:
 *      - user
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     responses:
 *       200:
 *         content:
 *          image/jpeg:
 *            schema:
 *              type: string
 *              format: binary
 *              description: The user's profile picture.
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notloggedin
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not logged in
 *       404:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 404 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notfound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no profile picture found
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while retrieving the profile picture
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
        return api_formatter(req, res, 500, "error", "An error occured while retrieving the profile picture", null, err, null, req.user.username);
    }
};

/**
 * @swagger
 * /profile_picture:
 *   delete:
 *     summary: Delete a user's profile picture
 *     description: Delete the profile picture of the user.
 *     tags:
 *      - user
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: profile picture deleted successfully
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notloggedin / unauthorised
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not logged in / You can't delete a profile picture with a google account
 *       404:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 404 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notfound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no profile picture found
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while deleting the profile picture / An error occured while saving file path
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
                    return api_formatter(req, res, 500, "error", "An error occured while deleting the profile picture", null, err, null, req.user.username); // return an error message
                }
                req.user.profilePicture = ""; // set the profile picture path to null
                req.user.save().then(() => { // save the user
                    return api_formatter(req, res, 200, "success", "profile picture deleted successfully", null, null, null, req.user.username); // return a success message
                }).catch((err) => { // if an error occured while saving the user
                    console.error(err);
                    return api_formatter(req, res, 500, "error", "An error occured while saving file path", null, err, null, req.user.username); // return an error message
                });
            });
        }
    } catch (err) { // if an error occured while deleting the file
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while deleting the profile picturee", null, err, null, req.user.username);
    }
};

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get a user's active sessions
 *     description: Retrieve all active sessions for the user.
 *     tags:
 *      - user
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: sessions retrieved successfully
 *                data:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      session_id:
 *                        type: string
 *                        description: The session ID.
 *                        example: abc123
 *                      session_type:
 *                        type: string
 *                        description: the session type. ( can be google or default )
 *                        example: default
 *                      expire:
 *                        type: string
 *                        format: date-time
 *                        description: The session expiration date.
 *                        example: 2023-10-02T12:34:56Z
 *                      user_agent:
 *                        type: string
 *                        description: The user agent of the session.
 *                        example: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3
 *                      connexionIp:
 *                        type: string
 *                        description: The connexion IP of the session.
 *                        example: 255-255-255-255
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notloggedin
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not logged in
 *       404:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 404 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notfound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no sessions found
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while retrieving the sessions
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
        return api_formatter(req, res, 500, "error", "An error occured while retrieving the sessions", null, err, null, req.user.username); // return an error message
    }
};

/**
 * @swagger
 * /sessions:
 *   delete:
 *     summary: Delete a user's active sessions
 *     description: Delete specified active sessions for the user.
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionsIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The IDs of the sessions to delete.
 *                 example: ["sessionId1", "sessionId2", ...]
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: "['sessionId1', 'sessionId2', ...] deleted successfully"
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no sessions ids were provided
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notloggedin
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not logged in
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while deleting the sessions
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
        return api_formatter(req, res, 500, "error", "An error occured while deleting sessions", null, err, null, req.user.username);
    }
};

/**
 * @swagger
 * /forgotpassword:
 *   post:
 *     summary: Request a password reset
 *     description: Request a password reset by providing the user's email.
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: email sent successfully, check your spam folder
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no email was provided
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: unauthorised
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: You can't reset the password of a google account
 *       404:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 404 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notfound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: no user found with the provided email
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while requesting the password reset / Error while sending email
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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

/**
 * @swagger
 * /resetpassword:
 *   post:
 *     summary: Reset a user's password
 *     description: Reset a user's password by providing a valid reset token and a new password.
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: The reset token.
 *                 example: someRandomToken123
 *               newPassword:
 *                 type: string
 *                 description: The new password.
 *                 example: newPassword123
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: password reset successfully
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: missing reset token or password
 *       404:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 404 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notfound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: the provided token doesn't exist or is expired / no user found with the provided token
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while resetting the password
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.resetpassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body; // get the reset token and the new password from the body
        if (!resetToken || !newPassword) // if the reset token or the new password is not provided
            return api_formatter(req, res, 400, "missing_informations", "missing reset token or password", null, null, null); // return an error message

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex"); // hash the token
        const passwordResetToken = await TokenModel.findOne({ // find the token in the database
            token: hashedToken,
            expiresAt: { $gt: Date.now() },
            type: "passwordReset"
        });

        if (!passwordResetToken) // if the token is not found
            return api_formatter(req, res, 404, "notfound", "the provided token doesn't exist or is expired", null, null, null); // return an error message

        const user = await UserModel.findOne({ unique_id: passwordResetToken.userId }); // find the user in the database
        if (!user) // if the user is not found
            return api_formatter(req, res, 404, "notfound", "no user found with the provided token", null, null, null); // return an error message
        // if we arrive here it means the user created a token for changing his password,
        // but he remembered his password, logged in, deleted his account and for some reason
        // decided to enter the token on the reset password page

        user.oldPassword = user.password; // set the old password
        user.password = newPassword; // set the new password
        user.passwordChangedAt = Date.now(); // set the password changed at field

        await user.save().then(async () => { // save the user
            await passwordResetToken.deleteOne(); // delete the token
            return api_formatter(req, res, 200, "success", "password reset successfully", null, null, null); // return a success message
        }).catch((err) => { // if an error occured while saving the user
            console.error(err);
            return api_formatter(req, res, 500, "error", "An error occured while resetting password", null, err, null);  // return an error message
        });
    } catch (err) { // if an error occured while resetting the password
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while resetting password", null, err, null);
    }
};

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update a user's profile
 *     description: Update the user's profile information.
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     tags:
 *      - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The new username.
 *                 example: newUsername
 *               email:
 *                 type: string
 *                 description: The new email address.
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 200 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: success
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: profile updated successfully
 *       400:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 400 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: missing_informations / email_already_exist / username_already_exist
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: some of the information were not provided / an account with the provided email already exist / an account with the provided username already exist
 *       401:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 401 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: notloggedin
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not logged in
 *       500:
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  description: The status code.
 *                  example: 500 
 *                messageStatus:
 *                  type: string
 *                  description: The status message.
 *                  example: error
 *                message:
 *                  type: string
 *                  description: The message.
 *                  example: An error occured while updating the profile
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
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
            return api_formatter(req, res, 500, "error", "An error occured while updating profile", null, err, null, req.user.username); // return an error message
        });
    } catch (err) { // if an error occured while updating the profile
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while updating profile", null, err, null, req.user.username); // return an error message
    }
};
