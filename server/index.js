const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");
const Product = require("./models/Product");
const Collection = require("./models/Collection");
const ComparisonGroup = require("./models/ComparisonGroup");
require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());

dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("MongoDB connection error name:", error.name);
        console.error("MongoDB connection error message:", error.message);
    });


app.get("/api/products", async (req, res) => {
    try {
        const { search, collection, source } = req.query;
        const filter = {};
        if (collection) {
            filter.collection = collection;
        }
        if (source) {
            filter.source = source;
        }
        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }
        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Fetch products error:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
});
const PORT = process.env.PORT || 5003;

app.post("/api/products", async (req, res) => {
    try {
        const { title, url, source, image, price, notes, collection } = req.body;

        if (!title || !url || !source) {
            return res.status(400).json({
                message: "Title, URL, and source are required",
            });
        }
        const existingProduct = await Product.findOne({ url: req.body.url });

        if (existingProduct) {
            return res.status(409).json({
                message: "Product with this URL already exists",
                product: existingProduct,
            });
        }

        const newProduct = await Product.create({
            title: req.body.title,
            url: req.body.url,
            source: req.body.source,
            image: req.body.image || "",
            price: req.body.price || "",
            notes: req.body.notes || "",
            collection: req.body.collection || "Uncategorized"

        });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Create product error:", error);
        res.status(400).json({ message: "Failed to create product" });
    }
});
app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        console.error("Fetch single product error: ", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});
app.put("/api/products/:id", async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                url: req.body.url,
                source: req.body.source,
                image: req.body.image || "",
                price: req.body.price || "",
                notes: req.body.notes || "",
                collection: req.body.collection || "Uncategorized"

            },
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(updatedProduct);
    } catch (error) {
        console.error("Update product error:", error);
        res.status(400).json({ message: "Failed to update product" });
    }
});
app.delete("/api/products/:id", async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
});

app.get("/api/collections", async (req, res) => {
    try {
        const collections = await Collection.find().sort({ createdAt: -1 });
        res.json(collections);
    } catch (error) {
        console.error("Fetch collections error:", error);
        res.status(500).json({ message: "Failed to fetch collections" });
    }
});

app.post("/api/collections", async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Collection name is required",
            });
        }
        const existingCollection = await Collection.findOne({
            name: req.body.name,
        });
        if (existingCollection) {
            return res.status(409).json({
                message: "Collection already exists",
                collection: existingCollection,
            });
        }
        const newCollection = await Collection.create({
            name: req.body.name,
            description: req.body.description || "",
        });

        res.status(201).json(newCollection);
    } catch (error) {
        console.error("Create collection error: ", error);
        res.status(400).json({ message: "Failed to create collection " });
    }
});

app.put("/api/collections/:id", async (req, res) => {
    try {
        const updatedCollection = await Collection.findByIdAndUpdate(req.params.id,
            {
                name: req.body.name,
                description: req.body.description || "",
            },
            {
                new: true, runValidators: true
            }
        );
        if (!updatedCollection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.json(updatedCollection);
    } catch (error) {
        console.error("Update collection error: ", error);
        res.status(400).jsonp({ message: "Failed to update collection " });
    }
});
app.delete("/api/collections/:id", async (req, res) => {
    try {
        const deletedCollection = await Collection.findByIdAndDelete(req.params.id);
        if (!deletedCollection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.json({ message: "Collection deleted successfully" });
    } catch (error) {
        console.error("Delete collection error:", error);
        res.status(500).json({ message: "Failed to delete collection" });
    }
});

app.get("/api/comparisons", async (req, res) => {
    try {
        const groups = await ComparisonGroup.find()
            .populate("productIds")
            .sort({ createdAt: -1 });

        res.json(groups);
    } catch (error) {
        console.error("Fetch comparison groups error:", error);
        res.status(500).json({ message: "Failed to fetch comparison groups" });
    }
});

app.post("/api/comparisons", async (req, res) => {
    try {
        const { name, productIds } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Comparison group name is required",
            });
        }

        const newGroup = await ComparisonGroup.create({
            name,
            productIds: productIds || [],
        });

        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Create comparison group error:", error);
        res.status(400).json({ message: "Failed to create comparison group" });
    }
});

app.put("/api/comparisons/:id", async (req, res) => {
    try {
        const { name, productIds } = req.body;

        const updatedGroup = await ComparisonGroup.findByIdAndUpdate(
            req.params.id,
            {
                name,
                productIds: productIds || [],
            },
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
});

app.delete("/api/comparisons/:id", async (req, res) => {
    try {
        const deletedGroup = await ComparisonGroup.findByIdAndDelete(req.params.id);

        if (!deletedGroup) {
            return res.status(404).json({ message: "Comparison group not found" });
        }

        res.json({ message: "Comparison group deleted successfully" });
    } catch (error) {
        console.error("Delete comparison group error:", error);
        res.status(500).json({ message: "Failed to delete comparison group" });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})