const { mainDB } = require("../mongo");
const mongoose = require("mongoose");

const actionReactionSchema = new mongoose.Schema({
    unique_id: { // this is the actionReaction id that will be used to identify the actionReaction we don't use _id to avoid security issues
        type: String,
        unique: [true, "The Unique ID is already taken for this actionReactionSchema"],
        trim: true
    },
    creator_id: { // this will be used list every session that the actionReaction created
        type: String,
    },
    tokens: { // this will be used to store the discord token
        type: Object,
        default: {}
    },
    active: {
        type: Boolean,
        default: true
    },
    Name: { // this will be the Name
        type: String,
        required: [true, "Name is required"],
    },
    Action: { // this will be the action
        type: Object,
        required: [true, "action is required"],
    },
    Reaction: { // this will be the Reaction
        type: Object,
        required: [true, "Reaction is required"],
    },
    CachedData: { // this will be the CachedData
        type: Object,
        default: {}
    },
    Treated: { // this will be used to know if the actionReaction was treated
        type: Boolean,
        default: true
    },
    Errors: { // this will be used to store the errors
        type: String,
        default: ""
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

actionReactionSchema.pre("save", function (next) {
    try {
        const actionReaction = this;
        actionReaction.LastModificationDate = Date.now();
        next();
    } catch (err) {
        next(err);
    }
});


const actionReaction = mainDB.model("actionReaction", actionReactionSchema); // this will create the actionReaction model

module.exports = actionReaction; // this will export the actionReaction model