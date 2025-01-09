const { mainDB } = require("../mongo");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    unique_id: { // this is the user id that will be used to identify the user we don't use _id to avoid security issues
        type: String,
        unique: [true, "The Unique ID is already taken for this userSchema"],
        trim: true
    },
    link_session_id: { // this will be used list every session that the user created
        type: Array,
    },
    discord_token: { // this will be used to store the discord token
        type: Object,
        default: {}
    },
    github_token: { // this will be used to store the github token
        type: Object,
        default: {}
    },
    spotify_token: { // this will be used to store the github token
        type: Object,
        default: {}
    },
    twitch_token: { // this will be used to store the twitch token
        type: Object,
        default: {}
    },
    email: { // this will be used to identify the user
        type: String,
        unique: [true, "an account already exist on this email!"], // this will be used to avoid having multiple accounts with the same email
        lowercase: true,
        trim: true,
        required: [true, "email is required"],
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // this will be used to validate the email
            },
            message: "{VALUE} is not a valid email!"
        },
    },
    emailVerified: { // this will be used to know if the user's email is verified
        type: Boolean,
        default: false
    },
    role: { // this will be used to know the user's role
        type: String,
        enum: ["normal", "admin"],
        required: [true, "Please specify user role"],
        default: "normal"
    },
    username: { // this will be used to identify the user
        type: String,
        unique: [true, "an account already exist on this username!"],
        maxlength: [20, "username can't be more than 20 characters"],
        required: [true, "username is required"],
    },
    profilePicturePath: { // this will be used to store the user's profile picture path
        type: String,
        default: ""
    },
    password: { // this will be used to store the user's password
        type: String,
        required: "Your password is required",
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(v);
            },
            message: "Password must contain at least 8 characters, including uppercase, lowercase letters and numbers"
        },
        max: [32, "Password can't be more than 32 characters"]
    },
    oldPassword: { // this will be used to store the user's old password if he change the password
        type: String,
        max: 100,
        default: ""
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },
    creationIp: { // this will be used to store the IP that created the user
        type: String,
    },
    LastModificationDate: { // this will be used to know when the user's data was last modified
        type: Date,
        default: Date.now
    },
    LastModificationIp: { // this will be used to know the IP that last modified the user's data
        type: String,
        default: ""
    },
    createdAt: { // this will be used to know when the user was created
        type: Date,
        default: Date.now
    },
    accountType: { // this will be used to know the account type
        type: String,
        default: "default"
    }
});

userSchema.pre("save", function (next) {
    try {
        const user = this;
        user.LastModificationIp = user.creationIp;
        user.LastModificationDate = Date.now();

        if (!user.isModified("password")) return next(); // if the password is not modified, we don't need to hash it

        bcrypt.genSalt(10, function (err, salt) { // this will generate a salt to hash the password
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) { // this will hash the password
                if (err) return next(err);

                user.password = hash;
                user.passwordChangedAt = Date.now();
                next();
            });
        });
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password); // this will compare the password with the hashed password
};

userSchema.statics.emailExists = async function (email) { // this will check if the email already exists in the database
    try {
        const found = await this.findOne({ email: email });
        return !!found;
    } catch (err) {
        console.error(err);
        return true;
    }
};

userSchema.statics.usernameExists = async function (username) { // this will check if the username already exists in the database
    try {
        return !!(await this.findOne({ username: username }));
    } catch (err) {
        console.error(err);
        return true;
    }
};

const User = mainDB.model("User", userSchema); // this will create the User model

module.exports = User; // this will export the User model