const nodemailer = require("nodemailer");
const ActionReactionModel = require("../../database/models/actionReaction");

// This is the transporter for sending emails
const mailSender = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAILER_EMAIL,
        pass: process.env.EMAILER_PASSWORD,
    },
});

// This function will send an email
async function sendEmail({ to, subject, html }) {
    try {
        await mailSender.sendMail({
            from: process.env.EMAILER_EMAIL, // Sender address
            to, // List of receivers
            subject, // Subject line
            html, // HTML body
        });
    } catch (err) {
        console.error("Error while sending email:", err);
        throw err;
    }
}

async function extractData(AREA, prefix) {
    try {
        let message = "<h1>" + prefix + "</h1>" || "";


        if (AREA.CachedData == "error") {
            message = "<h1>an error occured : </h1><br><b>" + (AREA.Errors.message || " while fetching the data") + "</b><br>on the AREA with name : <br><b>" + AREA.Name + "</b>";
        } else {
            if (AREA.Action.service == "spotify") {
                if (AREA.Action.arguments.on == "currently_playing") {
                    message += "<h1><b>" + AREA.CachedData.item.name + "</b></h1><h2><b> by " + AREA.CachedData.item.artists[0].name + "</b></h2><a href='" + AREA.CachedData.item.external_urls.spotify + "' style='font-size: 15px' target='_blank'>" + AREA.CachedData.item.external_urls.spotify + "</a>";
                }
                else if (AREA.Action.arguments.on == "liked_track") {
                    let Datas = "";
                    AREA.CachedData.items.slice(0, 10).forEach(data => {
                        Datas += "<h2><b>" + data.track.name + "</b> by <b>" + data.track.artists[0].name + "</b> -> <a href='" + data.track.external_urls.spotify + "' style='font-size: 15px' target='_blank'>link</a></h2>";
                    });
                    message += Datas;
                }
                else if (AREA.Action.arguments.on == "new_liked_track") {
                    message += "<h1><b>" + AREA.CachedData.items[0].track.name + "</b></h1><h2><b> by " + AREA.CachedData.items[0].track.artists[0].name + "</b></h2><a href='" + AREA.CachedData.items[0].track.external_urls.spotify + "' style='font-size: 15px' target='_blank'>" + AREA.CachedData.items[0].track.external_urls.spotify + "</a>";
                }
            } else if (AREA.Action.service == "github") {
                if (AREA.Action.arguments.on == "new_repo") {
                    message += "<h1><b>" + AREA.CachedData[0].name + "</b></h1><h2><b> created by " + AREA.CachedData[0].owner.login + "</b></h2><a href='" + AREA.CachedData[0].html_url + "' style='font-size: 15px' target='_blank'>" + AREA.CachedData[0].html_url + "</a>";
                } else if (AREA.Action.arguments.on == "new_issue") {
                    message += "<h1><b>" + AREA.CachedData.items[0].title + "</b></h1><h2><b> created by " + AREA.CachedData.items[0].user.login + "</b></h2><a href='" + AREA.CachedData.items[0].html_url + "' style='font-size: 15px' target='_blank'>" + AREA.CachedData.items[0].html_url + "</a>";
                } else if (AREA.Action.arguments.on == "new_pr") {
                    message += "<h1><b>" + AREA.CachedData.items[0].title + "</b></h1><h2><b> created by " + AREA.CachedData.items[0].user.login + "</b></h2><a href='" + AREA.CachedData.items[0].html_url + "' style='font-size: 15px' target='_blank'>" + AREA.CachedData.items[0].html_url + "</a>";
                } else if (AREA.Action.arguments.on == "new_commit") {
                    message += "<h1><b>" + AREA.CachedData.items[0].commit.message + "</b></h1><h2><b> by " + AREA.CachedData.items[0].author.login + "</b></h2><h3> on repo <b>" + AREA.CachedData.items[0].repository.name + "</b></h3><a href='" + AREA.CachedData.items[0].html_url + "' style='font-size: 15px' target='_blank'>" + AREA.CachedData.items[0].html_url + "</a>";
                }
            } else if (AREA.Action.service == "twitch") {
                if (AREA.Action.arguments.on == "new_follow") {
                    message += "<h1><b>" + AREA.tokens.twitch_user_data.login + "</b></h1><h2><b> now follow " + AREA.CachedData.data[0].broadcaster_login + "</b></h2> <img src='" + AREA.CachedData.data[0].broadcaster_info.profile_image_url + "' style='width: 100px; height: 100px;'>";
                } else if (AREA.Action.arguments.on == "following_online") {
                    message += "<h1><b>" + AREA.CachedData[0].user_name + "</b></h1><h2><b> is now online : " + AREA.CachedData[0].title + "</b></h2><h3> and is playing : <b>" + AREA.CachedData[0].game_name + "</b></h3>" + (AREA.CachedData[0].is_mature ? "<h4>⚠️  the content has been marked as restricted, the content is reserved for the adults </h4>" : "") + "<a href='https://twitch.tv/" + AREA.CachedData[0].user_name + "' style='font-size: 15px' target='_blank'>link</a>";
                }
            } else {
                console.error("Service not found : " + AREA.Action.service + " for action " + AREA.Action);
                message = "ERROR: Service not found : " + AREA.Action.service + " for action " + AREA.Action;
            }
        }
        return message;
    } catch (err) {
        console.error(err);
        return "An error occured";
    }
}

async function ActionGmail(AREA) {
    console.log("Treating Gmail Action : " + AREA.unique_id);
}

async function ReactionGmail(AREA) {
    const actionReactions = await ActionReactionModel.findOne({ "unique_id": AREA.unique_id });
    try {
        if (!actionReactions) {
            console.error("ActionReaction not found");
            return;
        }
        if (actionReactions.Reaction.service != "gmail") {
            console.error("Reaction service is not gmail");
            return;
        }
        if (actionReactions.Treated == true)
            return;
        const Arguments = actionReactions.Reaction.arguments;
        const Datas = await extractData(actionReactions, Arguments.message);
        await sendEmail({ // send the email
            to: Arguments.email,
            subject: Arguments.object,
            html: Datas
        });
        actionReactions.Treated = true;
        await actionReactions.save();
        return;
    } catch (err) {
        console.error(err);
        console.error(err.response?.data);
        return;
    }
}

module.exports = {
    ActionGmail,
    ReactionGmail
};