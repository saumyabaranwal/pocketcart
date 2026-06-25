const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            // never returned by default in queries (e.g. User.find())
            select: false,
        },
        name: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);