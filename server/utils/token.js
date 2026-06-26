const jwt = require("jsonwebtoken");

const JWT_EXPIRES_IN = "7d";

function signToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };