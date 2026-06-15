const express = require("express");
const router = express.Router();

const { createShelter, getAllShelters, getShelterById, getNearbyShelters, updateShelter, deleteShelter } = require("../controllers/shelterController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public endpoints
router.get("/", getAllShelters);
router.get("/nearby", getNearbyShelters);
router.get("/:id", getShelterById);

// Admin only endpoints
router.post("/", protect, adminOnly, createShelter);
router.put("/:id", protect, adminOnly, updateShelter);
router.delete("/:id", protect, adminOnly, deleteShelter);

module.exports = router;
