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
        const services = ["github", "discord", "spotift"];
        const messages = {
            "github": "You need to connect your github account to use github's",
            "discord": "You need to connect your discord account to use discord's",
            "spotify": "You need to connect your spotify account to use spotify's"
        };

        for (const service of services) {
            if (action.service == service && req.user[`${service}_token`] == null)
                return api_formatter(req, res, 400, "error", `${messages[service]} action`, null);
            if (reaction.service == service && req.user[`${service}_token`] == null)
                return api_formatter(req, res, 400, "error", `${messages[service]} reaction`, null);
        }

        const getToken = (service) => req.user[`${service}_token`] ? req.user[`${service}_token`].access_token : "";

        const actionToken = getToken(action.service);
        const reactionToken = getToken(reaction.service);

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
        return api_formatter(req, res, 500, "error", "An error occured while trying to create the area", null, err);
    }
};

exports.getArea = async (req, res) => {
    try {
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

exports.deleteArea = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id)
            return api_formatter(req, res, 400, "error", "Missing required fields", null);
        if (!await ActionReactionModel.exists({ unique_id: id }))
            return api_formatter(req, res, 404, "notFound", "Action Reaction not found");
        await ActionReactionModel.deleteOne({ unique_id: id });
        return api_formatter(req, res, 200, "success", "Action Reaction deleted");
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to get the discord token", null, err);
    }
};

exports.patchArea = async (req, res) => {
    try {
        const { id, name, action, reaction } = req.body;
        if (!id || !name || !action || !reaction)
            return api_formatter(req, res, 400, "error", "Missing required fields", null);
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


exports.getRawDataArea = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id)
            return api_formatter(req, res, 400, "error", "Missing required fields", null);
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

exports.postActiveArea = async (req, res) => {
    try {
        const { id, active } = req.body;
        if (!id)
            return api_formatter(req, res, 400, "error", "Missing required fields", null);
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