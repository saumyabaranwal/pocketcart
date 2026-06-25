const mongoose = require("mongoose");
const comparisonGroupSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name:{
            type: String,
            required: true,
            trim: true,
        },
        productIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("ComparisonGroup", comparisonGroupSchema);