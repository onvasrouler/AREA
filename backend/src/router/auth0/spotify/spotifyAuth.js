const api_formatter = require("../../../middleware/api-formatter.js");
const axios = require("axios");
const AreaModel = require("../../../database/models/actionReaction.js");

async function updateUserAreas(AreaUser, UserToken) {
    let areas = await AreaModel.find({ creator_id: AreaUser.unique_id });
    for (let area of areas)
        if (area.tokens && area.tokens.spotify)
            await AreaModel.updateOne(
                { unique_id: area.unique_id },
                { $set: { "tokens.spotify": UserToken } }
            );
}

/**
 * @swagger
 * /auth/callback/spotify:
 *   post:
 *     summary: Login with spotify
 *     description: This will take the code given by spotify and generate a token for the client
 *     tags: 
 *       - spotify Auth
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: The code given by spotify auth
 *                 required: true
 *                 example: "AQC7 ... 3Q"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: The status code.
 *                   example: 200
 *                 messageStatus:
 *                   type: string
 *                   description: The status message.
 *                   example: success
 *                 message:
 *                   type: string
 *                   description: The message.
 *                   example: spotify token has been saved
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
 *                  example: no_code
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: code is required when trying to generate a token
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
 *                  example: An error occured while trying to get the spotify token
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.spotifyCallback = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "no_code", "code is required when trying to generate a token", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://accounts.spotify.com/api/token",
                new URLSearchParams({
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    client_secret: process.env.SPOTIFY_SECRET,
                    code: code,
                    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                    grant_type: "authorization_code",
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token", null, tokenResponse.data);

            req.user.spotify_token = tokenResponse.data;
            req.user.spotify_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Spotify token has been saved");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token", null, err);
    }
};

/**
 * @swagger
 * /auth/refresh/spotify:
 *   post:
 *     summary: Refresh the spotify token
 *     description: This will refresh the spotify token
 *     tags: 
 *       - spotify Auth
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
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: The status code.
 *                   example: 200
 *                 messageStatus:
 *                   type: string
 *                   description: The status message.
 *                   example: success
 *                 message:
 *                   type: string
 *                   description: The message.
 *                   example: spotify token has been refreshed
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
 *                  example: error
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you first have to login to spotify to be able to refresh your token
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
 *                  example: An error occurred while trying to refresh the spotify token / An error occured while trying to get the spotify token re log-in spotify
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.spotifyRefresh = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const spotify_token = req.user.spotify_token;
        if (!spotify_token)
            return api_formatter(req, res, 400, "error", "you first have to login to spotify to be able to refresh your token", null, null, null);
        const refresh_token = spotify_token.refresh_token;
        if (!refresh_token)
            return api_formatter(req, res, 400, "error", "you first have to login to spotify to be able to refresh your token", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://accounts.spotify.com/api/token",
                new URLSearchParams({
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    refresh_token: refresh_token,
                    client_secret: process.env.SPOTIFY_SECRET,
                    grant_type: "refresh_token",
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the spotify token", null, tokenResponse.data);
            if (!tokenResponse.data.refresh_token)
                tokenResponse.data.refresh_token = refresh_token;
            req.user.spotify_token = tokenResponse.data;
            req.user.spotify_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Spotify token has been refreshed");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the spotify token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token re log-in spotify", null, err);
    }
};

/**
 * @swagger
 * /mobileauth/callback/spotify:
 *   post:
 *     summary: Login with spotify on mobile
 *     description: This will take the code given by spotify and generate a token for the mobile client
 *     tags: 
 *       - spotify Auth
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: The code given by spotify auth
 *                 required: true
 *                 example: "AQC7 ... 3Q"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: The status code.
 *                   example: 200
 *                 messageStatus:
 *                   type: string
 *                   description: The status message.
 *                   example: success
 *                 message:
 *                   type: string
 *                   description: The message.
 *                   example: spotify token has been saved for the mobile client
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
 *                  example: no_code
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: code is required when trying to generate a token with the mobile client
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
 *                  example: An error occured while trying to get the spotify token on mobile
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.spotifyCallbackMobile = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "no_code", "code is required when trying to generate a token with the mobile client", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://accounts.spotify.com/api/token",
                new URLSearchParams({
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    client_secret: process.env.SPOTIFY_SECRET,
                    code: code,
                    redirect_uri: process.env.SPOTIFY_REDIRECT_URI_MOBILE,
                    grant_type: "authorization_code",
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token on mobile", null, tokenResponse.data);

            req.user.spotify_token = tokenResponse.data;
            req.user.spotify_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Spotify token has been saved using mobile auth");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token on mobile", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the spotify token on mobile", null, err);
    }
};

/**
 * @swagger
 * /logout/spotify:
 *   post:
 *     summary: Logout from spotify
 *     description: This will delete the spotify token from the user and all the areas that are linked to spotify
 *     tags: 
 *       - spotify Auth
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
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: The status code.
 *                   example: 200
 *                 messageStatus:
 *                   type: string
 *                   description: The status message.
 *                   example: success
 *                 message:
 *                   type: string
 *                   description: The message.
 *                   example: spotify token has been deleted
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
 *                  example: An error occured while trying to delete the spotify token
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.logoutSpotify = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        req.user.spotify_token = {};
        await req.user.save();
        await updateUserAreas(req.user, "");
        return api_formatter(req, res, 200, "success", "Spotify token has been deleted");
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to delete the spotify token", null, err);
    }
};
