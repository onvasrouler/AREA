const discordBot = require("../../../utils/discord.js");
const api_formatter = require("../../../middleware/api-formatter.js");
const AreaModel = require("../../../database/models/actionReaction.js");

async function updateUserAreas(AreaUser, UserToken) {
    let areas = await AreaModel.find({ creator_id: AreaUser.unique_id });
    for (let area of areas)
        if (area.tokens && area.tokens.discord)
            await AreaModel.updateOne(
                { unique_id: area.unique_id },
                { $set: { "tokens.discord": UserToken } }
            );
}

/**
 * @swagger
 * /auth/callback/discord:
 *   post:
 *     summary: Login with discord
 *     description: This will take the code given by discord and generate a token for the client
 *     tags: 
 *       - Discord Auth
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
 *                 description: The code given by discord auth
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
 *                   example: Discord token has been saved
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
 *                  example: An error occured while trying to get the discord token
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.discordCallback = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "no_code", "code is required when trying to generate a token", null, null, null);
        try {
            const params = new URLSearchParams();
            params.append("client_id", discordBot.user.id);
            params.append("client_secret", process.env.DISCORD_SECRET);
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);
            params.append("scope", "identify guilds");

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: "POST",
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            });
            let parsedData = await response.json();
            if (!parsedData.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, parsedData);
            if (parsedData.access_token) {
                parsedData.expires_at = Date.now() + (parsedData.expires_in * 1000);
                req.user.discord_token = parsedData;
                await req.user.save();
                await updateUserAreas(req.user, parsedData.access_token);
                return api_formatter(req, res, 200, "success", "Discord token has been saved");
            } else {
                console.error(parsedData);
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, parsedData);
            }
        } catch (error) {
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, err);
    }
};

/**
 * @swagger
 * /auth/refresh/discord:
 *   post:
 *     summary: Refresh the discord token
 *     description: This will refresh the discord token
 *     tags: 
 *       - Discord Auth
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
 *                   example: Discord token has been refreshed
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
 *                 example: you first have to login to discord to be able to refresh your token
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
 *                  example: An error occurred while trying to refresh the discord token / An error occured while trying to get the discord token re log-in discord
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.discordRefresh = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const discord_token = req.user.discord_token;
        if (!discord_token)
            return api_formatter(req, res, 400, "error", "you first have to login to discord to be able to refresh your token", null, null, null);
        const refresh_token = discord_token.refresh_token;
        if (!refresh_token)
            return api_formatter(req, res, 400, "error", "you first have to login to discord to be able to refresh your token", null, null, null);
        try {
            const params = new URLSearchParams();
            params.append("grant_type", "refresh_token");
            params.append("refresh_token", refresh_token);

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: "POST",
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            });
            const parsedData = await response.json();
            if (!parsedData.access_token)
                return api_formatter(req, res, 500, "error", "An error occurred while trying to refresh the discord token", null, parsedData);
            req.user.discord_token = parsedData;
            req.user.discord_token.expires_at = Date.now() + parsedData.expires_in * 1000;
            await req.user.save();
            await updateUserAreas(req.user, parsedData.access_token);
            return api_formatter(req, res, 200, "success", "Discord token has been refreshed");
        } catch (error) {
            console.error(error.response?.data);
            req.user.discord_token = {};
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token re log-in discord", null, error);

        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, err);
    }
};

/**
 * @swagger
 * /mobileauth/callback/discord:
 *   post:
 *     summary: Login with discord on mobile
 *     description: This will take the code given by discord and generate a token for the mobile client
 *     tags: 
 *       - Discord Auth
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
 *                 description: The code given by discord auth
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
 *                   example: Discord token has been saved for the mobile client
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
 *                  example: An error occured while trying to get the discord token on mobile
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.discordCallbackMobile = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "no_code", "code is required when trying to generate a token with the mobile client", null, null, null);
        try {
            const params = new URLSearchParams();
            params.append("client_id", discordBot.user.id);
            params.append("client_secret", process.env.DISCORD_SECRET);
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI_MOBILE);
            params.append("scope", "identify guilds");

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: "POST",
                body: params,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            });
            let parsedData = await response.json();
            if (!parsedData.access_token)
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token on mobile", null, parsedData);
            if (parsedData.access_token) {
                parsedData.expires_at = Date.now() + (parsedData.expires_in * 1000);
                req.user.discord_token = parsedData;
                await req.user.save();
                await updateUserAreas(req.user, parsedData.access_token);
                return api_formatter(req, res, 200, "success", "Discord token has been saved for the mobile client");
            } else {
                console.error(parsedData);
                return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token on mobile", null, parsedData);
            }
        } catch (error) {
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token on mobile", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token on mobile", null, err);
    }
};

/**
 * @swagger
 * /logout/discord:
 *   post:
 *     summary: Logout from discord
 *     description: This will delete the discord token from the user and all the areas that are linked to discord
 *     tags: 
 *       - Discord Auth
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
 *                   example: Discord token has been deleted
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
 *                  example: An error occured while trying to delete the discord token
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.logoutDiscord = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        req.user.discord_token = {};
        await req.user.save();
        await updateUserAreas(req.user, "");
        return api_formatter(req, res, 200, "success", "Discord token has been deleted");
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to delete the discord token", null, err);
    }
};
