const api_formatter = require("../../middleware/api-formatter.js");
const ActionReactionModel = require("../../database/models/actionReaction");
const crypto = require("crypto");

exports.postArea = async (req, res) => {
    try {
        const { action, reaction, name } = req.body;
        if (!name)
            return api_formatter(req, res, 400, "MissingInfos", "Missing area name", null);
        if (!action || !reaction)
            return api_formatter(req, res, 400, "MissingInfos", "Missing required fields", null);
        if (action.service == "github" && req.user.github_token == null)
            return api_formatter(req, res, 400, "error", "You need to connect your github account to use github's action", null);
        if (action.service == "discord" && req.user.discord_token == null)
            return api_formatter(req, res, 400, "error", "You need to connect your discord account to use discord's action", null);
        if (reaction.service == "discord" && req.user.discord_token == null)
            return api_formatter(req, res, 400, "error", "You need to connect your discord account to use discord's reaction", null);
        if (reaction.service == "github" && req.user.github_token == null)
            return api_formatter(req, res, 400, "error", "You need to connect your github account to use github's reaction", null);

        const actionToken = action.service == "github" ? req.user.github_token.access_token :
            action.service == "discord" ? req.user.discord_token.access_token : "";

        const reactionToken = reaction.service == "github" ? req.user.github_token.access_token :
            reaction.service == "discord" ? req.user.discord_token.access_token : "";
        const tokens = `{
            "${action.service}": "${actionToken}",
            "${reaction.service}": "${reactionToken}"
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
        return api_formatter(req, res, 200, "success", "Action Reaction saved");
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, err);
    }
};

exports.getArea = async (req, res) => {
    try {
        const actionReactions = await ActionReactionModel.find({ creator_id: req.user.unique_id });
        const parsedData = actionReactions.map(actionReaction => ({
            id: actionReaction.unique_id,
            name: actionReaction.Name,
            action: actionReaction.Action,
            reaction: actionReaction.Reaction
        }));
        return api_formatter(req, res, 200, "success", "Action Reaction found", parsedData);
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, err);
    }
};

exports.deleteArea = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id)
            return api_formatter(req, res, 400, "error", "Missing required fields", null);
        await ActionReactionModel.deleteOne({ unique_id: id });
        return api_formatter(req, res, 200, "success", "Action Reaction deleted");
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, err);
    }
};