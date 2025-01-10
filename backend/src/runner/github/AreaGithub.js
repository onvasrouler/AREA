const ActionReactionModel = require("../../database/models/actionReaction");
const axios = require("axios");

async function getGithubUserData(token, url) {
    try {
        const prsResponse = await axios.get(
            url,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return prsResponse.data;
    } catch (err) {
        return { "ErrorOnGitFetch": err.response?.data ? err.response?.data : err };
    }
}

async function ActionGithub(AREA) {
    const actionReactions = await ActionReactionModel.findOne({ "unique_id": AREA.unique_id });
    try {
        if (!actionReactions) {
            console.error("ActionReaction not found");
            return;
        }
        if (actionReactions.Action.service != "github") {
            console.error("Action service is not github");
            return;
        }
        if (actionReactions.tokens.github == null) {
            console.error("Github token is missing");
            return;
        }
        const TriggerEvent = actionReactions.Action.arguments.on;
        let Datas = "";
        switch (TriggerEvent) {
        case "new_issue":
            Datas = await getGithubUserData(actionReactions.tokens.github, "https://api.github.com/search/issues?q=is:issue+author:@me");
            break;
        case "new_pr":
            Datas = await getGithubUserData(actionReactions.tokens.github, "https://api.github.com/search/issues?q=type:pr+author:@me");
            break;
        case "new_commit":
            Datas = await getGithubUserData(actionReactions.tokens.github, "https://api.github.com/search/commits?q=author:@me");
            break;
        case "new_repo":
            Datas = await getGithubUserData(actionReactions.tokens.github, "https://api.github.com/user/repos");
            break;
        default:
            console.error("Unknown action");
            Datas = "unknownAction";
        }
        if (Datas == "unknownAction")
            return;
        if (Datas.ErrorOnGitFetch) {
            if (actionReactions.CachedData != "error")
                actionReactions.Treated = false;
            else
                actionReactions.Treated = true;
            actionReactions.Errors = Datas.ErrorOnGitFetch;
            actionReactions.CachedData = "error";
            await actionReactions.save();
            return;
        }

        //avoid treating the same data twice and avoid treating data that has already been treated and avoid treating data when it decrease
        if (TriggerEvent == "new_commit" || TriggerEvent == "new_pr" || TriggerEvent == "new_issue") {
            Datas.items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            if (actionReactions.CachedData.total_count && actionReactions.CachedData.total_count != 0 && Datas.total_count != 0) {
                if (actionReactions.CachedData.total_count === Datas.total_count && actionReactions.CachedData.items[0].id === Datas.items[0].id) {
                    actionReactions.Treated = true;
                } else if (actionReactions.CachedData.total_count < Datas.total_count) {
                    actionReactions.Treated = false;
                }
            } else {
                actionReactions.Treated = true;
            }

        } else if (TriggerEvent == "new_repo") {
            Datas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            if (Datas.length != 0) {
                if (actionReactions.CachedData[0] && actionReactions.CachedData[0].id === Datas[0].id && actionReactions.CachedData.length === Datas.length) {
                    actionReactions.Treated = true;
                } else if (actionReactions.CachedData.length < Datas.length) {
                    actionReactions.Treated = false;
                }
            }
        }
        actionReactions.CachedData = Datas;
        await actionReactions.save();
        return;
    } catch (err) {
        console.error(err);
        console.error(err.response?.data);
        return;
    }

}

async function ReactionGithub(AREA) {
    const actionReactions = await ActionReactionModel.findOne({ "unique_id": AREA.unique_id });
    try {
        if (!actionReactions) {
            console.error("ActionReaction not found");
            return;
        }
        if (actionReactions.Reaction.service != "github") {
            console.error("Action service is not github");
            return;
        }
        if (actionReactions.tokens.github == null) {
            console.error("Github token is missing");
            return;
        }

        let Datas = "";
        const TriggerEvent = actionReactions.Action.arguments.on;

        switch (TriggerEvent) {
        case "issues":
            Datas = await getGithubUserData(actionReactions.tokens.github, "https://api.github.com/search/issues?q=is:issue+author:@me");
            break;
        case "pr":
            Datas = await getGithubUserData(actionReactions.tokens.github, "https://api.github.com/search/issues?q=type:pr+author:@me");
            break;
        case "commit":
            Datas = await getGithubUserData(actionReactions.tokens.github, "https://api.github.com/search/commits?q=author:@me");
            break;
        case "repo":
            Datas = await getGithubUserData(actionReactions.tokens.github, "https://api.github.com/user/repos");
            break;
        default:
            console.error("Unknown action");
            Datas = "unknownAction";
        }
        if (Datas == "unknownAction")
            return;
        if (Datas.ErrorOnGitFetch) {
            actionReactions.Errors = Datas.ErrorOnGitFetch;
            actionReactions.CachedData = "error";
            await actionReactions.save();
            return;
        }
        if (TriggerEvent == "new_commit" || TriggerEvent == "new_pr" || TriggerEvent == "new_issue") {
            Datas.items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        } else if (TriggerEvent == "new_repo") {
            Datas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        actionReactions.CachedData = Datas;
        actionReactions.CachedData.content = actionReactions.Reaction.arguments.content;
        await actionReactions.save();
        return;
    } catch (err) {
        console.error(err);
        console.error(err.response?.data);
        return;
    }
}

module.exports = {
    ActionGithub,
    ReactionGithub
};