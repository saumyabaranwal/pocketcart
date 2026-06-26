const Product = require("../models/Product");

async function getProducts(req, res) {
    try {
        const { search, collection, source } = req.query;
        const filter = { userId: req.userId };

        if (collection) filter.collection = collection;
        if (source) filter.source = source;
        if (search) filter.title = { $regex: search, $options: "i" };

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Fetch products error:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
}

async function createProduct(req, res) {
    try {
        const { title, url, source, image, price, notes, collection } = req.body;

        if (!title || !url || !source) {
            return res.status(400).json({ message: "Title, URL, and source are required" });
        }

        const existingProduct = await Product.findOne({ userId: req.userId, url });

        if (existingProduct) {
            return res.status(409).json({
                message: "Product with this URL already exists",
                product: existingProduct,
            });
        }

        const newProduct = await Product.create({
            userId: req.userId,
            title,
            url,
            source,
            image: image || "",
            price: price || "",
            notes: notes || "",
            collection: collection || "Uncategorized",
        });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Create product error:", error);
        res.status(400).json({ message: "Failed to create product" });
    }
}

async function getProductById(req, res) {
    try {
        const product = await Product.findOne({ _id: req.params.id, userId: req.userId });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error("Fetch single product error: ", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
}

async function updateProduct(req, res) {
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            {
                title: req.body.title,
                url: req.body.url,
                source: req.body.source,
                image: req.body.image || "",
                price: req.body.price || "",
                notes: req.body.notes || "",
                collection: req.body.collection || "Uncategorized",
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
}

async function deleteProduct(req, res) {
    try {
        const deletedProduct = await Product.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
}

module.exports = { getProducts, createProduct, getProductById, updateProduct, deleteProduct };