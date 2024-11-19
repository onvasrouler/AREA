const { mainDB } = require("../mongo");
const mongoose = require("mongoose");

var hour = 3600000;
var day = hour * 24;
var month = day * 30;


const sessionSchema = new mongoose.Schema({
    unique_session_id: {
        type: String,
        unique: true,
        trim: true
    },
    session_type: {
        type: String,
        enum: ["default", "google"],
        default: "default"
    },
    user_agent: {
        type: String,
        unique: false,
    },
    signed_id: {
        type: String,
        lowercase: true,
    },
    user_signed_id: {
        type: String,
    },
    connexionIp: {
        type: String,
        unique: false,
    },
    expire: {
        type: Date,
        default: Date.now + month
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Session = mainDB.model("session", sessionSchema);

module.exports = Session;