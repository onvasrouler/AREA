const { mainDB } = require("../mongo");
const mongoose = require("mongoose");


const tokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "User",
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        enum: ["emailVerification", "passwordReset", "deleteAccount"],
        required: true,
    },
});

const Token = mainDB.model("Token", tokenSchema);

module.exports = Token;
