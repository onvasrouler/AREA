const api_formatter = require("../../../middleware/api-formatter.js");
const axios = require("axios");
const AreaModel = require("../../../database/models/actionReaction.js");


async function updateUserAreas(AreaUser, UserToken) {
    let areas = await AreaModel.find({ creator_id: AreaUser.unique_id });
    for (let area of areas)
        if (area.tokens && area.tokens.github)
            await AreaModel.updateOne(
                { unique_id: area.unique_id },
                { $set: { "tokens.github": UserToken } }
            );
}

/**
 * @swagger
 * /auth/callback/github:
 *   post:
 *     summary: Login with github
 *     description: This will take the code given by github and generate a token for the client
 *     tags: 
 *       - github Auth
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
 *                 description: The code given by github auth
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
 *                   example: github token has been saved
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
 *                  example: An error occured while trying to get the github token
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.githubCallback = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "no_code", "code is required when trying to generate a token", null, null, null);
        try {
            const tokenResponse = await axios.post(
                "https://github.com/login/oauth/access_token",
                {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_SECRET,
                    code: code
                },
                {
                    headers: { Accept: "application/json" },
                }
            );
            if (!tokenResponse.data.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the github token", null, tokenResponse.data);

            req.user.github_token = tokenResponse.data;
            req.user.github_token.expires_at = Date.now() + tokenResponse.data.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token);
            return api_formatter(req, res, 200, "success", "Github token has been saved");
        } catch (error) {
            console.error(error);
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the github token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the github token", null, err);
    }
};

/**
 * @swagger
 * /auth/refresh/github:
 *   post:
 *     summary: Refresh the github token
 *     description: This will refresh the github token
 *     tags: 
 *       - github Auth
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
 *                   example: github token has been refreshed
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
 *                 example: you first have to login to github to be able to refresh your token
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
 *                  example: An error occurred while trying to refresh the github token / An error occured while trying to get the github token re log-in github
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.githubRefresh = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const github_token = req.user.github_token;
        if (!github_token)
            return api_formatter(req, res, 400, "error", "you first have to login to github to be able to refresh your token", null, null, null);
        const refresh_token = github_token.refresh_token;
        if (!refresh_token)
            return api_formatter(req, res, 400, "error", "you first have to login to github to be able to refresh your token", null, null, null);
        try {
            const params = new URLSearchParams();
            params.append("client_id", process.env.GITHUB_CLIENT_ID);
            params.append("client_secret", process.env.GITHUB_SECRET);
            params.append("grant_type", "refresh_token");
            params.append("refresh_token", refresh_token);

            const response = await axios.post("https://github.com/login/oauth/access_token", params, {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                },
            });

            const parsedData = response.data;
            if (!parsedData.access_token)
                return api_formatter(req, res, 500, "error", "An error occurred while trying to refresh the github token", null, parsedData);

            req.user.github_token = parsedData;
            req.user.github_token.expires_at = Date.now() + parsedData.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, parsedData.access_token);

            return api_formatter(req, res, 200, "success", "Github token has been refreshed");
        } catch (error) {
            console.error(error.response?.data || error);
            return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the github token", null, error.response?.data || error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the github token re log-in github", null, err);
    }
};

/**
 * @swagger
 * /logout/github:
 *   post:
 *     summary: logout with github
 *     description: This will delete the github token from the user and all the areas that are using it
 *     tags: 
 *       - github Auth
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
 *                   example: github token has been deleted
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
 *                  example: An error occured while trying to delete the github token
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.logoutGithub = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        req.user.github_token = {};
        await req.user.save();
        await updateUserAreas(req.user, "");
        return api_formatter(req, res, 200, "success", "Github token has been deleted");
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to delete the github token", null, err);
    }
};
