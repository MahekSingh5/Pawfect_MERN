const AdoptionRequest = require("../models/AdoptionRequest");
const Report = require("../models/Report");


// Create Adoption Request
exports.createAdoptionRequest = async (req, res) => {
  try {
    const { reportId, message, contactNumber } = req.body;

    // Check required fields
    if (!reportId || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Report ID and contact number are required",
      });
    }

    // Check if report exists
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Prevent duplicate requests
    const existingRequest = await AdoptionRequest.findOne({
      user: req.user._id,
      report: reportId,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already applied for adoption of this animal",
      });
    }

    // Create request
    const adoptionRequest = await AdoptionRequest.create({
      user: req.user._id,
      report: reportId,
      message,
      contactNumber,
    });

    res.status(201).json({
      success: true,
      message: "Adoption request submitted successfully",
      adoptionRequest,
    });

  } catch (error) {
    console.error("Create Adoption Request Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Get My Adoption Requests
exports.getMyAdoptionRequests = async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({
      user: req.user._id,
    })
      .populate("report")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });

  } catch (error) {
    console.error("Get My Adoption Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Admin - Get All Adoption Requests
exports.getAllAdoptionRequests = async (req, res) => {
  try {
    const requests = await AdoptionRequest.find()
      .populate("user", "name email")
      .populate("report")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });

  } catch (error) {
    console.error("Get All Adoption Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Admin - Update Adoption Status
exports.updateAdoptionStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const emailService = require("../services/emailService");

    const allowedStatuses = ["approved", "rejected"];

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const request = await AdoptionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Adoption request not found",
      });
    }

    // Prevent changing already approved/rejected requests
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    request.status = status;
    await request.save();

    const updatedRequest = await AdoptionRequest.findById(request._id)
      .populate("user", "name email")
      .populate("report");

    // Send email notification
    const user = await require("../models/User").findById(request.user);
    const report = await require("../models/Report").findById(request.report);

    if (status === "approved") {
      await emailService.sendAdoptionApprovalEmail(
        user.email,
        user.name,
        report.animalType
      );
    } else if (status === "rejected") {
      await emailService.sendAdoptionRejectionEmail(
        user.email,
        user.name,
        report.animalType,
        reason
      );
    }

    res.status(200).json({
      success: true,
      message: `Adoption request ${status}`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Update Adoption Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};