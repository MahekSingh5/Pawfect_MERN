const Feedback = require("../models/Feedback");
const User = require("../models/User");
const VolunteerProfile = require("../models/VolunteerProfile");
const Report = require("../models/Report");

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { volunteerId, reportId, rating, comment, type } = req.body;

    if (!rating || !type) {
      return res.status(400).json({
        success: false,
        message: "Rating and type are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const validTypes = ["volunteer", "adoption", "rescue"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback type",
      });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      volunteer: volunteerId,
      report: reportId,
      rating,
      comment,
      type,
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate("user", "name email")
      .populate("volunteer")
      .populate("report");

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: populatedFeedback,
    });
  } catch (error) {
    console.error("Create Feedback Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get feedback for a volunteer
exports.getVolunteerFeedback = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const feedback = await Feedback.find({ volunteer: volunteerId, type: "volunteer" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const averageRating =
      feedback.length > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      averageRating,
      feedbackCount: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error("Get Volunteer Feedback Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get feedback for a report
exports.getReportFeedback = async (req, res) => {
  try {
    const { reportId } = req.params;

    const feedback = await Feedback.find({ report: reportId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      feedbackCount: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error("Get Report Feedback Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get my feedback
exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate("volunteer")
      .populate("report")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      feedbackCount: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error("Get My Feedback Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user search history
exports.getSearchHistory = async (req, res) => {
  try {
    const SearchHistory = require("../models/SearchHistory");
    const history = await SearchHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Get Search History Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
