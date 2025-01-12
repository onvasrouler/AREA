const ActionReactionModel = require("../database/models/actionReaction");
const { ActionDiscord, ReactionDiscord } = require("./discord/AreaDiscord");
const { ActionGithub, ReactionGithub } = require("./github/AreaGithub.js");
const { ActionSpotify, ReactionSpotify } = require("./spotify/AreaSpotify.js");
const { ActionGmail, ReactionGmail } = require("./gmail/AreaGmail.js");
const { ActionTwitch, ReactionTwitch } = require("./twitch/AreaTwitch.js");

class runner {
    constructor() {
        this.is_active = true;
    }

    run() {
        if (this.is_active) {
            console.log("Starting runner...");
            setInterval(async () => {
                console.log("Running main function");
                await this.mainFunction();
            }, process.env.RUNNER_INTERVAL);
        }

    }

    async mainFunction() {
        await ActionReactionModel.find({}).then(async (actionReactions) => {
            for (const actionReaction of actionReactions) {
                if (actionReaction.active === false)
                    continue;
                console.log("Treat action and reaction for : " + actionReaction.unique_id + " with area name : " + actionReaction.Name);
                await this.treatAction(actionReaction);
                await this.treatReaction(actionReaction);
            }
        });
    }

    treatAction(AREA) {
        console.log("Treating Action : " + AREA.unique_id + " with area name : " + AREA.Name);
        const Action = AREA.Action;
        if (Action.service === "discord")
            return ActionDiscord(AREA);
        else if (Action.service === "github")
            return ActionGithub(AREA);
        else if (Action.service === "spotify")
            return ActionSpotify(AREA);
        else if (Action.service === "gmail")
            return ActionGmail(AREA);
        else if (Action.service === "twitch")
            return ActionTwitch(AREA);
        else {
            console.log("Service not found : " + Action.service + " for action " + JSON.stringify(Action));
            return "ERROR: Service not found : " + Action.service + " for action " + JSON.stringify(Action);
        }
    }

    treatReaction(AREA) {
        console.log("Treating Reaction : " + AREA.unique_id + " with area name : " + AREA.Name);
        const Reaction = AREA.Reaction;
        if (Reaction.service === "discord")
            return ReactionDiscord(AREA);
        else if (Reaction.service === "github")
            return ReactionGithub(AREA);
        else if (Reaction.service === "spotify")
            return ReactionSpotify(AREA);
        else if (Reaction.service === "gmail")
            return ReactionGmail(AREA);
        else if (Reaction.service === "twitch")
            return ReactionTwitch(AREA);
        else {
            console.log("Service not found : " + Reaction.service + " for reaction " + JSON.stringify(Reaction));
            return "ERROR: Service not found : " + Reaction.service + " for reaction " + JSON.stringify(Reaction);
        }
    }

    stop() {
        this.is_active = false;
    }

    start() {
        this.is_active = true;
    }
}

const ServerRunner = new runner();


module.exports = {
    ServerRunner
};