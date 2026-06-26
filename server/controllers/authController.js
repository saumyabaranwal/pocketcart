const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/token");

const SALT_ROUNDS = 10;

async function signup(req, res) {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name || "",
        });

        const token = signToken(newUser._id);

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Failed to sign up" });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = signToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Failed to log in" });
    }
}

async function getMe(req, res) {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: "Failed to fetch user" });
    }
}

module.exports = { signup, login, getMe };