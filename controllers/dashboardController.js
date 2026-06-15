const Report = require("../models/Report");
const VolunteerProfile = require("../models/VolunteerProfile");
const AdoptionRequest = require("../models/AdoptionRequest");
const Feedback = require("../models/Feedback");
const User = require("../models/User");

exports.getDashboardStats = async (req, res) => {
  try {
    // REPORT STATS
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const inProgressReports = await Report.countDocuments({ status: "in-progress" });
    const rescuedReports = await Report.countDocuments({ status: "rescued" });

    // Calculate rescue completion rate
    const rescueCompletionRate =
      totalReports > 0 ? ((rescuedReports / totalReports) * 100).toFixed(2) : 0;

    // VOLUNTEER STATS
    const totalVolunteers = await VolunteerProfile.countDocuments();
    const approvedVolunteers = await VolunteerProfile.countDocuments({ isApproved: true });
    const pendingVolunteers = await VolunteerProfile.countDocuments({ isApproved: false });

    // ADOPTION STATS
    const totalAdoptions = await AdoptionRequest.countDocuments();
    const pendingAdoptions = await AdoptionRequest.countDocuments({ status: "pending" });
    const approvedAdoptions = await AdoptionRequest.countDocuments({ status: "approved" });
    const rejectedAdoptions = await AdoptionRequest.countDocuments({ status: "rejected" });

    // FEEDBACK STATS
    const totalFeedback = await Feedback.countDocuments();
    const averageRating =
      totalFeedback > 0
        ? (
            await Feedback.aggregate([
              { $group: { _id: null, avgRating: { $avg: "$rating" } } },
            ])
          )[0]?.avgRating.toFixed(2)
        : 0;

    // USERS STATS
    const totalUsers = await User.countDocuments();

    // FINAL RESPONSE
    res.status(200).json({
      success: true,
      stats: {
        reports: {
          total: totalReports,
          pending: pendingReports,
          inProgress: inProgressReports,
          rescued: rescuedReports,
          completionRate: `${rescueCompletionRate}%`,
        },
        volunteers: {
          total: totalVolunteers,
          approved: approvedVolunteers,
          pending: pendingVolunteers,
        },
        adoptions: {
          total: totalAdoptions,
          pending: pendingAdoptions,
          approved: approvedAdoptions,
          rejected: rejectedAdoptions,
        },
        feedback: {
          total: totalFeedback,
          averageRating,
        },
        users: {
          total: totalUsers,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};