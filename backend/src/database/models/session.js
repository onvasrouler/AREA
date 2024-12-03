const { mainDB } = require("../mongo");
const mongoose = require("mongoose");

var hour = 3600000;
var day = hour * 24;
var month = day * 30;

// this will contain every data that is needed to create a session
const sessionSchema = new mongoose.Schema({
    unique_session_id: { // this is the session id that will be used to identify the session we don't use _id to avoid security issues
        type: String,
        unique: true,
        trim: true
    },
    session_type: { // this will be used to know if the session is a default session or a google session
        type: String,
        enum: ["default", "google"],
        default: "default"
    },
    user_agent: { // this will be used to know the user agent of the user that created the session, it is used to identify each sessions
        type: String,
        unique: false,
    },
    signed_id: { // this will be used to identify the session in the user's data
        type: String,
        lowercase: true,
    },
    user_signed_id: { // this will be used to to identify the user that created the session
        type: String,
    },
    connexionIp: { // this will be used to to identify the IP that created the session
        type: String,
        unique: false,
    },
    expire: { // this will be used to know when the session will expire
        type: Date,
        default: Date.now + month
    },
    createdAt: { // this will be used to know when the session was created
        type: Date,
        default: Date.now
    }
});

const Session = mainDB.model("session", sessionSchema);

module.exports = Session;