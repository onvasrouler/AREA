const { mainDB } = require("../mongo");
const mongoose = require("mongoose");

// this will contain every data that is needed to create a google user
const googleUsersSchema = new mongoose.Schema({
    unique_id: {
        type: String,
        unique: true,
        trim: true
    },
    google_id: {
        type: String,
        unique: [true, "An account with this Google ID already exists."],
        trim: true
    },
    link_session_id: {
        type: Array,
    },
    profilePicture: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        unique: [true, "An account with this email already exists."],
    },
    role: {
        type: String,
        enum: ["normal", "admin"],
        required: [true, "Please specify user role"],
        default: "normal"
    },
    username: {
        type: String,
        maxlength: [20, "Username must be less than 20 characters"],
        required: [true, "Please specify a username"],
    },
    creationIp: {
        type: String,
    },
    LastModification: {
        type: Date,
        default: Date.now
    },
    LastModificationIp: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    accountType: {
        type: String,
        default: "google"
    }
});

// before updating the user's data, we will update the LastModificationIp field to know the last IP that updated the user
googleUsersSchema.pre("save", function (next) {
    const user = this;
    user.LastModificationIp = user.creationIp;
    return next();
});

// this function will check if the email already exists in the database
googleUsersSchema.statics.emailExists = async function (email) {
    try {
        const found = await this.findOne({ email: email });
        return !!found;
    } catch (err) {
        console.error(err);
        return true;
    }
};

// this function will check if the username already exists in the database
const GoogleUsers = mainDB.model("GoogleUsers", googleUsersSchema);

// exporting the model
module.exports = GoogleUsers;