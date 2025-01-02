const ActionReactionModel = require("../database/models/actionReaction");
const { ActionDiscord, ReactionDiscord } = require("./discord/AreaDiscord");
const { ActionGithub, ReactionGithub } = require("./github/AreaGithub.js");
const { ActionSpotify, ReactionSpotify } = require("./spotify/AreaSpotify.js");

class runner {
    constructor() {
        this.is_active = true;
    }

    run() {
        if (this.is_active) {
            console.log("Running runner");
            setInterval(async () => {
                console.log("Running main function");
                await this.mainFunction();
            }, process.env.RUNNER_INTERVAL);
        }

    }

    async mainFunction() {
        await ActionReactionModel.find({}).then(async (actionReactions) => {
            for (const actionReaction of actionReactions) {
                await this.treatAction(actionReaction);
                await this.treatReaction(actionReaction);
            }
        });
    }

    treatAction(AREA) {
        const Action = AREA.Action;
        if (Action.service === "discord")
            return ActionDiscord(AREA);
        else if (Action.service === "github")
            return ActionGithub(AREA);
        else if (Action.service === "spotify")
            return ActionSpotify(AREA);
        else {
            console.log("Service not found : " + Action.service + " for action " + Action);
            return "ERROR: Service not found : " + Action.service + " for action " + Action;
        }
    }

    treatReaction(AREA) {
        const Reaction = AREA.Reaction;
        if (Reaction.service === "discord")
            return ReactionDiscord(AREA);
        else if (Reaction.service === "github")
            return ReactionGithub(AREA);
        else if (Reaction.service === "spotify")
            return ReactionSpotify(AREA);
        else {
            console.log("Service not found : " + Reaction.service + " for reaction " + Reaction);
            return "ERROR: Service not found : " + Reaction.service + " for reaction " + Reaction;
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