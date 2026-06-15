const express = require("express");
const router = express.Router();

const {applyVolunteer, getMyVolunteerProfile, getAllVolunteerProfiles, approveVolunteer, rejectVolunteer, deApproveVolunteer, updateVolunteerProfile} = require("../controllers/volunteerController");

const { protect, adminOnly} = require("../middleware/authMiddleware");
const { validateVolunteerApplication } = require("../middleware/validationMiddleware");

router.post("/apply", protect, validateVolunteerApplication, applyVolunteer);
router.get("/me", protect, getMyVolunteerProfile);
router.get("/all", protect, adminOnly, getAllVolunteerProfiles);
router.put("/approve/:id", protect, adminOnly, approveVolunteer);
router.put("/reject/:id", protect, adminOnly, rejectVolunteer);
router.put("/de-approve/:id", protect, adminOnly, deApproveVolunteer);
router.put("/update/:id", protect, updateVolunteerProfile);

module.exports = router;