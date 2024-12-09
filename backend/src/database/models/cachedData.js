const { mainDB } = require("../mongo");
const mongoose = require("mongoose");

const cachedDataSchema = new mongoose.Schema({
    unique_id: { // this is the actionReaction id that will be used to identify the actionReaction we don't use _id to avoid security issues
        type: String,
        unique: [true, "The Unique ID is already taken for this cachedDataSchema"],
        trim: true
    },
    user_signed_id: {
        type: String,
        unique: [true, "A User can have only one cached Data table"]
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    LastModificationDate: { // this will be used to know when the actionReaction's data was last modified
        type: Date,
        default: Date.now
    },
    createdAt: { // this will be used to know when the actionReaction was created
        type: Date,
        default: Date.now
    }
});

cachedDataSchema.pre("save", function (next) {
    try {
        const cachedData = this;
        cachedData.LastModificationDate = Date.now();
        next();
    } catch (err) {
        console.error(err);
        next(err);
    }
});

const cachedData = mainDB.model("cachedData", cachedDataSchema); // this will create the actionReaction model

module.exports = cachedData; // this will export the actionReaction model