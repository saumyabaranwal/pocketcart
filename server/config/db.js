const mongoose = require("mongoose");
const dns = require("dns");

async function connectDB() {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error name:", error.name);
        console.error("MongoDB connection error message:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;