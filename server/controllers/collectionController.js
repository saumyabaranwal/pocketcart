const Collection = require("../models/Collection");

async function getCollections(req, res) {
    try {
        const collections = await Collection.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(collections);
    } catch (error) {
        console.error("Fetch collections error:", error);
        res.status(500).json({ message: "Failed to fetch collections" });
    }
}

async function createCollection(req, res) {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Collection name is required" });
        }
        const existingCollection = await Collection.findOne({ userId: req.userId, name });
        if (existingCollection) {
            return res.status(409).json({
                message: "Collection already exists",
                collection: existingCollection,
            });
        }
        const newCollection = await Collection.create({
            userId: req.userId,
            name,
            description: description || "",
        });
        res.status(201).json(newCollection);
    } catch (error) {
        console.error("Create collection error: ", error);
        res.status(400).json({ message: "Failed to create collection " });
    }
}

async function updateCollection(req, res) {
    try {
        const updatedCollection = await Collection.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            {
                name: req.body.name,
                description: req.body.description || "",
            },
            { new: true, runValidators: true }
        );
        if (!updatedCollection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.json(updatedCollection);
    } catch (error) {
        console.error("Update collection error: ", error);
        res.status(400).json({ message: "Failed to update collection " });
    }
}

async function deleteCollection(req, res) {
    try {
        const deletedCollection = await Collection.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedCollection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.json({ message: "Collection deleted successfully" });
    } catch (error) {
        console.error("Delete collection error:", error);
        res.status(500).json({ message: "Failed to delete collection" });
    }
}

module.exports = { getCollections, createCollection, updateCollection, deleteCollection };