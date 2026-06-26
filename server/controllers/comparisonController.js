const ComparisonGroup = require("../models/ComparisonGroup");

async function getComparisons(req, res) {
    try {
        const groups = await ComparisonGroup.find({ userId: req.userId })
            .populate("productIds")
            .sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        console.error("Fetch comparison groups error:", error);
        res.status(500).json({ message: "Failed to fetch comparison groups" });
    }
}

async function createComparison(req, res) {
    try {
        const { name, productIds } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Comparison group name is required" });
        }
        const newGroup = await ComparisonGroup.create({
            userId: req.userId,
            name,
            productIds: productIds || [],
        });
        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Create comparison group error:", error);
        res.status(400).json({ message: "Failed to create comparison group" });
    }
}

async function updateComparison(req, res) {
    try {
        const { name, productIds } = req.body;
        const updatedGroup = await ComparisonGroup.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { name, productIds: productIds || [] },
            { new: true, runValidators: true }
        ).populate("productIds");
        if (!updatedGroup) {
            return res.status(404).json({ message: "Comparison group not found" });
        }
        res.json(updatedGroup);
    } catch (error) {
        console.error("Update comparison group error:", error);
        res.status(400).json({ message: "Failed to update comparison group" });
    }
}

async function deleteComparison(req, res) {
    try {
        const deletedGroup = await ComparisonGroup.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedGroup) {
            return res.status(404).json({ message: "Comparison group not found" });
        }
        res.json({ message: "Comparison group deleted successfully" });
    } catch (error) {
        console.error("Delete comparison group error:", error);
        res.status(500).json({ message: "Failed to delete comparison group" });
    }
}

module.exports = { getComparisons, createComparison, updateComparison, deleteComparison };