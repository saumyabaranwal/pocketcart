const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
    {
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
module.exports = mongoose.model("Product", productSchema);