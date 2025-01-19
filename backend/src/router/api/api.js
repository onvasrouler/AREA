const api_formatter = require("../../middleware/api-formatter.js");
const axios = require("axios");
const discordBot = require("../../utils/discord");

/**
 * @swagger
 * /profile_info:
 *   get:
 *     summary: Get the user's profile informations
 *     description: Get the user's profile informations such as username, email, account type, and the services the user is logged in.
 *     tags:
 *      - api
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
 *                 example: You are authenticated
 *                data:
 *                 type: object
 *                 description: The user informations.
 *                 example: {"username": "username", "email": "email", "account_type": "account_type", "logged_in_discord": "logged_in_discord", "discord_expire_at": "discord_expire_at", "logged_in_github": "logged_in_github", "github_expire_at": "github_expire_at", "logged_in_spotify": "logged_in_spotify", "spotify_expire_at": "spotify_expire_at", "logged_in_twitch": "logged_in_twitch", "twitch_expire_at": "twitch_expire_at"}
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
 *                  example: An error occurred while trying to get the user profile
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.profile = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error
        const services = ["discord", "github", "spotify", "twitch"]; // list of services
        const logged_in_status = {};

        services.forEach(service => {
            let logged_in = req.user[`${service}_token`] && req.user[`${service}_token`].access_token ? true : false;
            if (logged_in && req.user[`${service}_token`].expires_at < Date.now())
                logged_in = "session_expired";
            logged_in_status[`logged_in_${service}`] = logged_in;
        });

        const { logged_in_discord, logged_in_github, logged_in_spotify, logged_in_twitch } = logged_in_status;


        const user_infos = { // this will store the user informations
            "username": req.user.username,
            "email": req.user.email,
            "account_type": req.user.accountType,
            "logged_in_discord": logged_in_discord,
            "discord_expire_at": logged_in_discord ? req.user.discord_token.expires_at : null,
            "logged_in_github": logged_in_github,
            "github_expire_at": logged_in_github ? req.user.github_token.expires_at : null,
            "logged_in_spotify": logged_in_spotify,
            "spotify_expire_at": logged_in_spotify ? req.user.spotify_token.expires_at : null,
            "logged_in_twitch": logged_in_twitch,
            "twitch_expire_at": logged_in_twitch ? req.user.twitch_token.expires_at : null
        };
        return api_formatter(req, res, 200, "success", "You are authenticated", user_infos, null, null); // return the user informations
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occurred while trying to get the user profile", null, err, null);
    }
};

/**
 * @swagger
 * /invite_discord_bot:
 *   get:
 *     summary: Get the discord bot invitation link
 *     description: Get the discord bot invitation link to invite the bot to your server.
 *     tags:
 *      - api
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
 *                 example: discord invitation link getted with success
 *                data:
 *                 type: object
 *                 description: The discord invitation link.
 *                 example: "https://discord.com/api/oauth2/authorize?client_id=1313891258934231123&permissions=8&scope=bot%20applications.commands"
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
 *                  example: An error occured while trying to get the discord invitation link
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.inviteDiscordBot = async (req, res) => {
    try {
        const discordClientId = discordBot.user.id;
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&permissions=8&scope=bot%20applications.commands`;
        return api_formatter(req, res, 200, "success", "discord invitation link getted with success", inviteLink, null, null); // return the user informations
    } catch (err) { // if an error occured
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord invitation link", null, err, null);
    }
};

/**
 * @swagger
 * /get_my_discord_server:
 *   get:
 *     summary: Get the discord server the user is in
 *     description: Get the discord server the user is in and where the bot is present.
 *     tags:
 *      - api
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
 *                 example: list of matching guilds get with success
 *                data:
 *                 type: array
 *                 description: The list of matching guilds.
 *                 items:
 *                  type: object
 *                  properties:
 *                   id:
 *                    type: string
 *                    description: The guild id.
 *                    example: "123456789012345678"
 *                   name:
 *                    type: string
 *                    description: The guild name.
 *                    example: "My server"
 *                   icon:
 *                    type: string
 *                    description: The guild icon.
 *                    example: "http://example.com/icon.png"
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
 *                  example: An error occured while trying to get the list of matching discord servers
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.getDiscordServer = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error

        const matchingGuilds = req.guilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon
        }));
        return api_formatter(req, res, 200, "success", "list of matching guilds get with success", matchingGuilds, null, null); // return the user informations
    } catch (err) { // if an error occured
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the list of matching discord servers", null, err, null);
    }
};

/**
 * @swagger
 * /get_my_user_id:
 *   get:
 *     summary: Get the user's discord id
 *     description: Get the user's discord id.
 *     tags:
 *      - api
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
 *                 example: user id get with success
 *                data:  
 *                 type: string
 *                 description: The user id.
 *                 example: "123456789012"
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
 *                  example: An error occured while trying to get the user id
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.getMyUserId = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error

        return api_formatter(req, res, 200, "success", "user id get with success", req.discordUser.id, null, null); // return the user informations
    } catch (err) { // if an error occured
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the user id", null, err, null);
    }
};

/**
 * @swagger
 * /get_list_of_channels:
 *   get:
 *     summary: Get the list of text channels of a discord server
 *     description: Get the list of text channels of a discord server where the bot is present and the user is admin.
 *     tags:
 *      - api
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
 *               guildId:
 *                 type: string
 *                 description: The id of the discord server to get the text channels from.
 *                 example: "123456789012345678"
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
 *                  type: string
 *                  description: The message.
 *                  example: list of text channel of this server got with success
 *                data:
 *                  type: array
 *                  description: The list of text channels.
 *                  items:
 *                   type: object
 *                   properties:
 *                    id:
 *                     type: string
 *                     description: The channel id.
 *                     example: "13456789012345678"
 *                    name:
 *                     type: string
 *                     description: The channel name.
 *                     example: "general"
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
 *                  example: unauthorised_Server / missing_guildId
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you are not admin of this guild or the bot is not present there / guildId is required
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
 *                  example: An error occured while trying to get the discord server
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.getListOfChannels = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error

        const { guildId } = req.query;
        if (!guildId)
            return api_formatter(req, res, 400, "missing_guildId", "guildId is required", null, null, null);
        //check if the guildId is in req.quilds
        const guild = req.guilds.find(guild => guild.id === guildId);
        if (!guild)
            return api_formatter(req, res, 400, "unauthorised_Server", "you are not admin of this guild or the bot is not present there", null, null, null);
        // use discordBot to get the text channels of the guild
        const allChannels = discordBot.guilds.cache.get(guildId).channels.cache;
        const textChannels = allChannels.filter(channel => channel.type === 0);
        const channelsList = textChannels.map(channel => ({
            id: channel.id,
            name: channel.name,
        }));
        return api_formatter(req, res, 200, "success", "list of text channel of this server got with success", channelsList, null, null); // return the user informations
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord server", null, err, null);
    }
};

/**
 * @swagger
 * /discord_manager:
 *   get:
 *     summary: Redirect to the mobile app
 *     description: Redirect to the mobile app with the discord code.
 *     tags:
 *      - api
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: the code to redirect to the mobile app with
 *     responses:
 *       200:
 *         description: Redirect to the mobile app with the discord code
 *         headers:
 *           Location:
 *             description: The location to redirect to
 *             schema:
 *               type: string
 *               example: "yourapp://discord?code=1234567890"
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
 *                  example: Missing_code
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you didn't provide any code
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
 *                  example: An error occured while trying to manage discord
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.manage_discord = async (req, res) => {
    try {
        const code = req.query.code;

        if (!code)
            return api_formatter(req, res, 400, "Missing_code", "you didn't provide any code");

        return res.redirect(`${process.env.MOBILE_APP_NAME}://discord?code=${code}`);
    } catch (error) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to manage discord", null, error, null);
    }
};

/**
 * @swagger
 * /twitch_manager:
 *   get:
 *     summary: Redirect to the mobile app
 *     description: Redirect to the mobile app with the twitch code.
 *     tags:
 *      - api
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: the code to redirect to the mobile app with
 *     responses:
 *       200:
 *         description: Redirect to the mobile app with the twitch code
 *         headers:
 *           Location:
 *             description: The location to redirect to
 *             schema:
 *               type: string
 *               example: "yourapp://twitch?code=1234567890"
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
 *                  example: Missing_code
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: you didn't provide any code
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
 *                  example: An error occured while trying to manage twitch
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.manage_twitch = async (req, res) => {
    try {
        const code = req.query.code;

        if (!code)
            return api_formatter(req, res, 400, "Missing_code", "you didn't provide any code");

        return res.redirect(`${process.env.MOBILE_APP_NAME}://twitch?code=${code}`);
    } catch (error) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to manage twitch", null, error, null);
    }
};

/**
 * @swagger
 * /get_pull_requests:
 *   get:
 *     summary: get the user's github pull requests
 *     description: get the user's github pull requests where the user is the author.
 *     tags:
 *      - api
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
 *                 example: your github pull requests have been fetched with success
 *                data:
 *                 type: object
 *                 description: The github pull requests.
 *                 example: {"total_count": 1, "incomplete_results": false, "items": [{}]}
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
 *                 example: you are not logged in / you are not logged in using github
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
 *                  example: An error occured while trying to get the github pull requests
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.getPullRequests = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error

        let githubCachedData = req.cachedData.data.githubPrCachedData;
        if (!githubCachedData || (githubCachedData.updatedAt + 10000) < Date.now()) {
            const token = req.user.github_token.access_token;
            if (!token)
                return api_formatter(req, res, 401, "notloggedin", "you are not logged in using github", null, null, null);
            const prsResponse = await axios.get(
                "https://api.github.com/search/issues?q=type:pr+author:@me",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const GithubData = {
                data: prsResponse.data,
                updatedAt: Date.now(),
            };
            req.cachedData.data = {
                ...req.cachedData.data,
                githubPrCachedData: GithubData
            };
            await req.cachedData.save();
            githubCachedData = GithubData.data;

        }
        return api_formatter(req, res, 200, "success", "your github pull requests have been fetched with success", githubCachedData, null, null); // return the user informations
    } catch (error) {
        console.error(error);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the github pull requests", null, error, null);
    }
};

/**
 * @swagger
 * /get_my_repos:
 *   get:
 *     summary: get the user's github repositories
 *     description: get the user's github repositories where the user is the owner.
 *     tags:
 *      - api
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
 *                 example: your github repository have been fetched with success
 *                data:
 *                 type: object
 *                 description: The github pull requests.
 *                 example: {"total_count": 1, "incomplete_results": false, "items": [{}]}
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
 *                 example: you are not logged in / you are not logged in using github
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
 *                  example: An error occured while trying to get the github repositories
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.getMyRepos = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error

        let githubCachedData = req.cachedData.data.githubRepoCachedData;
        if (!githubCachedData || (githubCachedData.updatedAt + 10000) < Date.now()) {
            const token = req.user.github_token.access_token;
            if (!token)
                return api_formatter(req, res, 401, "notloggedin", "you are not logged in using github", null, null, null);
            const reposResponse = await axios.get(
                "https://api.github.com/user/repos",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const GithubData = {
                data: reposResponse.data,
                updatedAt: Date.now(),
            };

            req.cachedData.data = {
                ...req.cachedData.data,
                githubRepoCachedData: GithubData
            };
            await req.cachedData.save();
            githubCachedData = GithubData.data;
        }
        return api_formatter(req, res, 200, "success", "your github repository have been fetched with success", githubCachedData, null, null); // return the user informations
    } catch (error) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the github repositories", null, error, null);
    }
};

/**
 * @swagger
 * /get_my_liked_tracks:
 *   get:
 *     summary: get the user's spotify liked tracks
 *     description: get the list of the user's liked tracks on spotify.
 *     tags:
 *      - api
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: string
 *         description: The number of liked tracks to get.
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
 *                  type: string
 *                  description: The message.
 *                  example: your liked tracks have been fetched with success
 *                data:
 *                  type: object
 *                  description: The liked tracks.
 *                  example: {"items": [{}]}
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
 *                  example: missing_limit / invalid_limit
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: limit is required / limit should be between 1 and 50
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
 *                 example: you are not logged in / you are not logged in using spotify
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
 *                  example: An error occured while trying to get the liked tracks
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.getMyLikedTracks = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error

        const { limit } = req.query || 10;
        if (!limit)
            return api_formatter(req, res, 400, "missing_limit", "limit is required", null, null, null);
        if (limit < 1 || limit > 50)
            return api_formatter(req, res, 400, "invalid_limit", "limit should be between 1 and 50", null, null, null);
        let spotifyCachedData = req.cachedData.data.spotifyLikedTracksCachedData;
        if (!spotifyCachedData || (spotifyCachedData.updatedAt + 10000) < Date.now()) {
            const token = req.user.spotify_token.access_token;
            if (!token)
                return api_formatter(req, res, 401, "notloggedin", "you are not logged in using spotify", null, null, null);
            const likedTracksResponse = await axios.get(
                "https://api.spotify.com/v1/me/tracks?limit=" + limit,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const SpotifyData = {
                data: likedTracksResponse.data,
                updatedAt: Date.now(),
            };
            req.cachedData.data = {
                ...req.cachedData.data,
                spotifyLikedTracksCachedData: SpotifyData
            };
            await req.cachedData.save();
            spotifyCachedData = SpotifyData.data;
        }
        return api_formatter(req, res, 200, "success", "your liked tracks have been fetched with success", spotifyCachedData, null, null); // return the user informations
    } catch (error) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the liked tracks", null, error, null);
    }
};

/**
 * @swagger
 * /get_currently_playing:
 *   get:
 *     summary: get the user's spotify currently playing track
 *     description: get the user's spotify track he is currently listening to
 *     tags:
 *      - api
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
 *                 example: your currently playing track has been fetched with success
 *                data:
 *                 type: object
 *                 description: The currently playing track.
 *                 example: {"item": {}}
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
 *                 example: you are not logged in / you are not logged in using spotify
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
 *                  example: An error occured while trying to get the currently playing track
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.getCurrentlyPlaying = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null); // return a 401 error

        let spotifyCachedData = req.cachedData.data.spotifyCurrentlyPlayingCachedData;
        if (!spotifyCachedData || (spotifyCachedData.updatedAt + 10000) < Date.now()) {
            const token = req.user.spotify_token.access_token;
            if (!token)
                return api_formatter(req, res, 401, "notloggedin", "you are not logged in using spotify", null, null, null);
            const currentlyPlayingResponse = await axios.get(
                "https://api.spotify.com/v1/me/player/currently-playing",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const SpotifyData = {
                data: currentlyPlayingResponse.data,
                updatedAt: Date.now(),
            };
            req.cachedData.data = {
                ...req.cachedData.data,
                spotifyCurrentlyPlayingCachedData: SpotifyData
            };
            await req.cachedData.save();
            spotifyCachedData = SpotifyData.data;
        }
        return api_formatter(req, res, 200, "success", "your currently playing track has been fetched with success", spotifyCachedData, null, null); // return the user informations
    } catch (error) {
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the currently playing track", null, error, null);
    }
};