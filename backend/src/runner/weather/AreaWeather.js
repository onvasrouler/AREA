const ActionReactionModel = require("../../database/models/actionReaction");
const axios = require("axios");
const opencage = require("opencage-api-client");

async function getCoordinates(cityName) {
    try {
        const data = await opencage.geocode({ q: cityName });
        if (data.status.code == 200 && data.results.length > 0) {
            console.log(data.results[0].geometry);
            return data.results[0].geometry;
        } else {
            console.log("Status:", data.status.message);
            return { "ErrorOnCoordinatesFetch": data.status.message };
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error.message);
        return { "ErrorOnCoordinatesFetch": error.message };
    }
}

async function getWeatherData(city) {
    try {
        const cityCoord = await getCoordinates(city);
        if (cityCoord.ErrorOnCoordinatesFetch)
            return { "ErrorOnWeatherFetch": cityCoord.ErrorOnCoordinatesFetch };
        const Response = await axios.get(
            "https://api.openweathermap.org/data/3.0/onecall?lat=" + cityCoord.lat + "&lon=" + cityCoord.lng + "&appid=" + process.env.WEATHER_API_KEY + "&units=metric"
        );
        return Response.data;
    } catch (err) {
        return { "ErrorOnWeatherFetch": err.response?.data ? err.response?.data : err };
    }
}

async function ActionWeather(AREA) {
    const actionReactions = await ActionReactionModel.findOne({ "unique_id": AREA.unique_id });
    let Datas = "";
    try {
        if (!actionReactions) {
            console.error("ActionReaction not found");
            return;
        }
        if (actionReactions.Action.service != "weather") {
            console.error("Action service is not Weather");
            return;
        }
        const Arguments = actionReactions.Action.arguments;
        if (Arguments.city == null) {
            console.error("City is missing");
            return;
        }
        if (Arguments.runtime == null) {
            console.error("Runtime is missing");
            return;
        }
        const runtimeConv = {
            "everyDay": 86400000,
            "everyHalfDay": 43200000,
            "everyHour": 3600000,
        };
        if (runtimeConv[Arguments.runtime] == null) {
            console.error("Runtime is not valid");
            return;
        }
        const Msruntime = runtimeConv[Arguments.runtime];

        if (actionReactions.CachedData.lastExecuted != null) {
            const lastExecuted = new Date(actionReactions.CachedData.lastExecuted);
            const now = new Date();
            const diff = Math.abs(now - lastExecuted);
            if (diff < Msruntime) {
                console.log("Action Weather : Runtime not reached for area : " + AREA.unique_id);
                return;
            }
        }

        Datas = await getWeatherData(Arguments.city);
        if (Datas.ErrorOnWeatherFetch) {
            await ActionReactionModel.updateOne(
                { "unique_id": AREA.unique_id },
                {
                    $set: {
                        "CachedData.data": null,
                        "CachedData.lastExecuted": new Date(),
                        "CachedData.status": "error",
                        "Errors": Datas.ErrorOnWeatherFetch,
                        "Treated": actionReactions.CachedData.status != "error" ? false : true
                    }
                }
            );
            return;
        }
        await ActionReactionModel.updateOne(
            { "unique_id": AREA.unique_id },
            {
                $set: {
                    "CachedData.data": Datas,
                    "CachedData.lastExecuted": new Date(),
                    "CachedData.status": "success",
                    "Errors": null,
                    "Treated": false
                }
            }
        );
        return;
    } catch (err) {
        console.error("An error occured on action Weather :\n" + err + "\nWith data :\n" + Datas);
        return;
    }
}

async function ReactionWeather(AREA) {
    console.log("Treating Discord Action : " + AREA.unique_id);
}

module.exports = {
    ActionWeather,
    ReactionWeather
};