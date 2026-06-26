const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getComparisons, createComparison, updateComparison, deleteComparison } = require("../controllers/comparisonController");

router.use(authMiddleware);

router.get("/", getComparisons);
router.post("/", createComparison);
router.put("/:id", updateComparison);
router.delete("/:id", deleteComparison);

module.exports = router;