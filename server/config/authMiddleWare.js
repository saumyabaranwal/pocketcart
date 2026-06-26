const { verifyToken } = require("../utils/token");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({ message: "Not authorized, token invalid or expired" });
    }
}

module.exports = authMiddleware;