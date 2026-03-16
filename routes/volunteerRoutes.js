const express = require("express");
const router = express.Router();

const {applyVolunteer, getMyVolunteerProfile, getAllVolunteerProfiles, approveVolunteer} = require("../controllers/volunteerController");

const { protect, adminOnly} = require("../middleware/authMiddleware");

router.post("/apply", protect, applyVolunteer);
router.get("/me", protect, getMyVolunteerProfile);
router.get("/all", protect, adminOnly, getAllVolunteerProfiles);
router.put("/approve/:id", protect, adminOnly, approveVolunteer);

module.exports = router;