const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const comparisonRoutes = require("./routes/comparisonRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/comparisons", comparisonRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});