const express = require("express");
const router = express.Router();

const {createAdoptionRequest, getMyAdoptionRequests, updateAdoptionStatus, getAllAdoptionRequests,} = require("../controllers/adoptionController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

//user routes
router.post("/", protect, createAdoptionRequest);
router.get("/my", protect, getMyAdoptionRequests);

//admin routes
router.get("/all", protect, adminOnly, getAllAdoptionRequests);
router.put("/:id/status", protect, adminOnly, updateAdoptionStatus);

module.exports = router;