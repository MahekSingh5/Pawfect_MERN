const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getVolunteerFeedback,
  getReportFeedback,
  getMyFeedback,
  getSearchHistory,
} = require("../controllers/feedbackController");

const { protect } = require("../middleware/authMiddleware");

// User - Create feedback
router.post("/", protect, createFeedback);

// User - Get my feedback
router.get("/my", protect, getMyFeedback);

// User - Get search history
router.get("/search-history", protect, getSearchHistory);

// Public - Get feedback for volunteer
router.get("/volunteer/:volunteerId", getVolunteerFeedback);

// Public - Get feedback for report
router.get("/report/:reportId", getReportFeedback);

module.exports = router;
