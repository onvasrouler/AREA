const api_formatter = require("../../middleware/api-formatter.js");
const ActionReactionModel = require("../../database/models/actionReaction");
const crypto = require("crypto");

/**
 * @swagger
 * /area:
 *   post:
 *     summary: Create a new Action Reaction
 *     description: Create a new Action Reaction with the given action and reaction
 *     tags: 
 *       - Area
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
 *               action:
 *                 type: object
 *                 description: The action object
 *                 properties:
 *                   service:
 *                     type: string
 *                     description: The service of the action
 *                     example: spotify
 *                   arguments:
 *                     type: object
 *                     description: The arguments of the action
 *                     example: { "on": "currently_playing" }
 *               reaction:
 *                 type: object
 *                 description: The reaction object
 *                 properties:
 *                   service:
 *                     type: string
 *                     description: The service of the reaction
 *                     example: discord
 *                   arguments:
 *                    type: object
 *                    description: The arguments of the reaction
 *                    example: { "react": "message", "server": "1308348420037279747", "channel": "1325848053206352018", "message": "I'm currently playing :" }
 *               name:
 *                 type: string
 *                 description: The name of the area
 *                 required: true
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
 *                   example: Action Reaction saved
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The unique id of the area
 *                       example: 60b3b3b3b3b3b3b3b3b3b3b3
 *                     name:
 *                       type: string
 *                       description: The name of the area
 *                       example: My Area
 *                     action:
 *                       type: object
 *                       description: The action object
 *                       properties:
 *                         service:
 *                           type: string
 *                           description: The service of the action
 *                           example: spotify
 *                         arguments:
 *                           type: object
 *                           description: The arguments of the action
 *                           example: { "on": "currently_playing" }
 *                     reaction:
 *                       type: object
 *                       description: The reaction object
 *                       properties:
 *                         service:
 *                           type: string
 *                           description: The service of the reaction
 *                           example: discord
 *                         arguments:
 *                          type: object
 *                          description: The arguments of the reaction
 *                          example: { "react": "message", "server": "1308348420037279747", "channel": "1325848053206352018", "message": "I'm currently playing :" }
 *                     active:
 *                       type: boolean
 *                       description: The status of the area (active or not)
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: The creation date of the area
 *                       example: 2021-05-30T14:00:00.000Z
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
 *                 example: Missing area name / Missing required fields
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
 *                  example: An error occured while trying to create the area
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.postArea = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { action, reaction, name } = req.body;
        if (!name)
            return api_formatter(req, res, 400, "missing_informations", "Missing area name", null);
        if (!action || !reaction)
            return api_formatter(req, res, 400, "missing_informations", "Missing required fields", null);
        const messages = {
            "github": "You need to connect your github account to use github's",
            "discord": "You need to connect your discord account to use discord's",
            "spotify": "You need to connect your spotify account to use spotify's",
            "twitch": "You need to connect your twitch account to use twitch's"
        };

        const getToken = (service) => req.user[`${service}_token`] ? req.user[`${service}_token`].access_token : "";

        const actionToken = getToken(action.service);
        const reactionToken = getToken(reaction.service);

        if (!actionToken && action.service !== "discord")
            return api_formatter(req, res, 400, "error", `${messages[action.service]} action`, null);
        if (!reactionToken && reaction.service !== "gmail" && reaction.service !== "discord")
            return api_formatter(req, res, 400, "error", `${messages[action.service]} reaction`, null);

        const tokens = `{
            "${action.service}": "${actionToken}",
            "${reaction.service}": "${reactionToken}"
            ${(action.service === "twitch" || reaction.service === "twitch") ? `, "twitch_user_data": ${JSON.stringify(req.user.twitch_token.user_data)}` : ""}
        }`;

        const newActionReaction = new ActionReactionModel({
            unique_id: crypto.randomBytes(16).toString("hex"),
            Name: name,
            creator_id: req.user.unique_id,
            Action: action,
            Reaction: reaction,
            tokens: JSON.parse(tokens),
            user: req.user.unique_id
        });

        await newActionReaction.save();

        const NewAREAdata = {
            id: newActionReaction.unique_id,
            name: newActionReaction.Name,
            action: newActionReaction.Action,
            reaction: newActionReaction.Reaction,
            active: newActionReaction.active,
            created_at: newActionReaction.created_at
        };

        return api_formatter(req, res, 200, "success", "Action Reaction saved", NewAREAdata);
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to create the area", null, err);
    }
};

/**
 * @swagger
 * /area:
 *   get:
 *     summary: Get all the user's Action Reaction
 *     description: Get all the user's Action Reaction and give the data in a readable format
 *     tags: 
 *       - Area
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
 *                   example: Action Reaction found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The unique id of the area
 *                         example: 60b3b3b3b3b3b3b3b3b3b3b3
 *                       name:
 *                         type: string
 *                         description: The name of the area
 *                         example: My Area
 *                       action:
 *                         type: object
 *                         description: The action object
 *                         properties:
 *                           service:
 *                             type: string
 *                             description: The service of the action
 *                             example: spotify
 *                           arguments:
 *                             type: object
 *                             description: The arguments of the action
 *                             example: { "on": "currently_playing" }
 *                       reaction:
 *                         type: object
 *                         description: The reaction object
 *                         properties:
 *                           service:
 *                             type: string
 *                             description: The service of the reaction
 *                             example: discord
 *                           arguments:
 *                            type: object
 *                            description: The arguments of the reaction
 *                            example: { "react": "message", "server": "1308348420037279747", "channel": "1325848053206352018", "message": "I'm currently playing :" }
 *                       active:
 *                         type: boolean
 *                         description: The status of the area (active or not)
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the area
 *                         example: 2021-05-30T14:00:00.000Z
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
 *                  example: An error occured while trying to get the user's area
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.getArea = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const actionReactions = await ActionReactionModel.find({ creator_id: req.user.unique_id });
        const parsedData = actionReactions.map(actionReaction => ({
            id: actionReaction.unique_id,
            name: actionReaction.Name,
            action: actionReaction.Action,
            reaction: actionReaction.Reaction,
            active: actionReaction.active,
            created_at: actionReaction.created_at
        }));
        return api_formatter(req, res, 200, "success", "Action Reaction found", parsedData);
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the user's area", null, err);
    }
};

/**
 * @swagger
 * /area:
 *   delete:
 *     summary: Delete an Action Reaction
 *     description: delete an Action Reaction with the given id
 *     parameters:
 *       - in: header
 *         name: session
 *         required: true
 *         schema:
 *           type: string
 *         description: The session header
 *     tags:
 *      - Area
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                id:
 *                  type: string
 *                  description: "The id of the area to delete"
 *                  example: "60b3b3b3b3b3b3b3b3b3b3b3"
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
 *                 example: "Action Reaction deleted"
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
 *                 example: Missing required field id
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
 *                  example: notFound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: Action Reaction not found
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
 *                  example: An error occured while trying to delete the area
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.deleteArea = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { id } = req.body;
        if (!id)
            return api_formatter(req, res, 400, "missing_informations", "Missing required field id", null);
        if (!await ActionReactionModel.exists({ unique_id: id }))
            return api_formatter(req, res, 404, "notFound", "Action Reaction not found");
        await ActionReactionModel.deleteOne({ unique_id: id });
        return api_formatter(req, res, 200, "success", "Action Reaction deleted");
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to delete the area", null, err);
    }
};

/**
 * @swagger
 * /area:
 *   post:
 *     summary: Create a new Action Reaction
 *     description: Create a new Action Reaction with the given action and reaction
 *     tags: 
 *       - Area
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
 *               id:
 *                type: string
 *                description: "The id of the area to update"
 *                example: "60b3b3b3b3b3b3b3b3b3b3b3"
 *               action:
 *                 type: object
 *                 description: The action object
 *                 properties:
 *                   service:
 *                     type: string
 *                     description: The service of the action
 *                     example: spotify
 *                   arguments:
 *                     type: object
 *                     description: The arguments of the action
 *                     example: { "on": "currently_playing" }
 *               reaction:
 *                 type: object
 *                 description: The reaction object
 *                 properties:
 *                   service:
 *                     type: string
 *                     description: The service of the reaction
 *                     example: discord
 *                   arguments:
 *                    type: object
 *                    description: The arguments of the reaction
 *                    example: { "react": "message", "server": "1308348420037279747", "channel": "1325848053206352018", "message": "I'm currently playing :" }
 *               name:
 *                 type: string
 *                 description: The name of the area
 *                 required: true
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
 *                   example: Action Reaction updated
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
 *                 example: Missing required fields
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
 *                  example: notFound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: Action Reaction not found
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
 *                  example: An error occured while trying to update the area
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.patchArea = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { id, name, action, reaction } = req.body;
        if (!id || !name || !action || !reaction)
            return api_formatter(req, res, 400, "missing_informations", "Missing required fields", null);
        if (!await ActionReactionModel.exists({ unique_id: id }))
            return api_formatter(req, res, 404, "notFound", "Action Reaction not found");
        await ActionReactionModel.updateOne({ unique_id: id }, { Name: name, Action: action, Reaction: reaction });
        return api_formatter(req, res, 200, "success", "Action Reaction updated");
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to update the area", null, err);
    }
};

/**
 * @swagger
 * /rawdataarea:
 *   get:
 *     summary: Get all the data related to an Action Reaction
 *     description: Get all the data related to an Action Reaction including the action, reaction, active status, creation date, last modification date, cached data and error ( mostly used for debugging )
 *     tags: 
 *       - Area
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
 *               id:
 *                type: string
 *                description: "The id of the area to get the data from"
 *                example: "60b3b3b3b3b3b3b3b3b3b3b3"
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
 *                   example: Action Reaction found
 *                 data:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The unique id of the area
 *                         example: 60b3b3b3b3b3b3b3b3b3b3b3
 *                       name:
 *                         type: string
 *                         description: The name of the area
 *                         example: My Area
 *                       action:
 *                         type: object
 *                         description: The action object
 *                         properties:
 *                           service:
 *                             type: string
 *                             description: The service of the action
 *                             example: spotify
 *                           arguments:
 *                             type: object
 *                             description: The arguments of the action
 *                             example: { "on": "currently_playing" }
 *                       reaction:
 *                         type: object
 *                         description: The reaction object
 *                         properties:
 *                           service:
 *                             type: string
 *                             description: The service of the reaction
 *                             example: discord
 *                           arguments:
 *                            type: object
 *                            description: The arguments of the reaction
 *                            example: { "react": "message", "server": "1308348420037279747", "channel": "1325848053206352018", "message": "I'm currently playing :" }
 *                       active:
 *                         type: boolean
 *                         description: The status of the area (active or not)
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the area
 *                         example: 2021-05-30T14:00:00.000Z
 *                       LastModificationDate:
 *                         type: string
 *                         format: date-time
 *                         description: The last modification date of the area
 *                         example: 2021-05-30T14:00:00.000Z
 *                       CachedData:
 *                         type: object
 *                         description: The cached data
 *                         example: { "data": "data" }
 *                       Error:
 *                         type: object
 *                         description: if an error occured while trying to execute the action reaction it will be stored here
 *                         example: { "error": "error" }
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
 *                 example: Missing required fields
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
 *                  example: An error occured while trying to get the area's data
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.getRawDataArea = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { id } = req.body;
        if (!id)
            return api_formatter(req, res, 400, "missing_informations", "Missing required fields", null);
        const actionReactions = await ActionReactionModel.find({ unique_id: id });
        const parsedData = actionReactions.map(actionReaction => ({
            id: actionReaction.unique_id,
            name: actionReaction.Name,
            action: actionReaction.Action,
            reaction: actionReaction.Reaction,
            active: actionReaction.active,
            created_at: actionReaction.created_at,
            LastModificationDate: actionReaction.LastModificationDate,
            CachedData: actionReaction.CachedData ? actionReaction.CachedData : null,
            Error: actionReaction.Error ? actionReaction.Error : null

        }));
        return api_formatter(req, res, 200, "success", "Action Reaction found", parsedData);
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the area's data", null, err);
    }
};

/**
 * @swagger
 * /activeAreas:
 *   post:
 *     summary: Activate / Deactivate an Action Reaction
 *     description: Activate / Deactivate an Action Reaction with the given id and active status it will not delete the Action Reaction but it will stop it from executing or start it
 *     tags: 
 *       - Area
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
 *               id:
 *                type: object
 *                description: "the list of id of the area to update"
 *                example: ["61b3b3b3b3b3b3b3b3b3b3b3", "60b3b3b3b3b3b3b3b3b3b3b3"]
 *               active:
 *                type: boolean
 *                description: The status of the area (active or not)
 *                example: true
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
 *                   example: nbActionReaction Action Reaction activated / deactivated
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
 *                 example: Missing required fields
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
 *                  example: notFound
 *                message:
 *                 type: string
 *                 description: The message.
 *                 example: Action Reaction not found
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
 *                  example: An error occured while trying to update the active area
 *                data:
 *                  type: object
 *                  description: The data.
 *                  example: null
 *                error:
 *                 type: object
 *                 description: The error.
 *                 example: {"..." : "..."}
 */
exports.postActiveArea = async (req, res) => {
    try {
        if (!req.user || req.user == null) // if the user is not logged in
            return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
        const { id, active } = req.body;
        if (!id)
            return api_formatter(req, res, 400, "missing_informations", "Missing required fields", null);
        const actionReaction = await ActionReactionModel.find({ unique_id: id });
        if (actionReaction.length === 0)
            return api_formatter(req, res, 404, "notFound", "Action Reaction not found");
        await ActionReactionModel.updateMany({ unique_id: id }, { active });
        return api_formatter(req, res, 200, "success", `${actionReaction.length} Action Reaction ${active === true ? "activated" : "deactivated"}`);
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to update the active area", null, err);
    }
};