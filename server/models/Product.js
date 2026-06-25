const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        source:{
            type: String,
            required: true,
        },
        image:{
            type: String,
            default: "",
        },
        price:{
            type: String,
            default: "",
        },
        notes: {
            type: String,
            default: "",
        },
        collection: {
            type: String,
            default: "Uncategorized",
        },
    },
    {
        timestamps: true,
    }
);
productSchema.index({ userId: 1, url: 1 }, { unique: true });
module.exports = mongoose.model("Product", productSchema);