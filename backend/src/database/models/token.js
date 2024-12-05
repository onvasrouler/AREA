const { mainDB } = require("../mongo");
const mongoose = require("mongoose");


const tokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "userId is required for token"],
        ref: "User",
    },
    token: {
        type: String,
        required: [true, "Token is required"],
        unique: [true, "Token already exists"],
    },
    expiresAt: {
        type: Date,
        required: [true, "expiresAt is required for token"],
    },
    type: {
        type: String,
        enum: ["emailVerification", "passwordReset", "deleteAccount"],
        required: [true, "type is required for token"],
    },
});

const Token = mainDB.model("Token", tokenSchema);

module.exports = Token;
