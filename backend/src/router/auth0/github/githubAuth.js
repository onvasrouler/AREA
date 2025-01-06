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

exports.githubCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return api_formatter(req, res, 400, "error", "code is required", null, null, null);
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
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token)
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

exports.githubRefresh = async (req, res) => {
    try {
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
            await req.user.save();
            await updateUserAreas(req.user, tokenResponse.data.access_token)

            return api_formatter(req, res, 200, "success", "Github token has been refreshed");
        } catch (error) {
            console.error(error.response?.data);
            return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the github token", null, error);
        }
    }
    catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "error", "An error occured while trying to refresh the github token", null, err);
    }
};