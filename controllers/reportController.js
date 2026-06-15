const Report = require("../models/Report");
const RescueUpdate = require("../models/RescueUpdate");
const cloudinary = require("../config/cloudinary");
const VolunteerProfile = require("../models/VolunteerProfile");
const { emitRescueUpdate, emitToRescueRoom } = require("../socket/socketManager");

exports.createReport = async (req , res) => {
    try{
        
        const { animalType, address, description, contactNumber, latitude, longitude } = req.body;
        
        if (!animalType || !address || !description || !contactNumber || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ 
                success: false,
                message: "Please fill all required fields: animalType, address, description, contactNumber, latitude, longitude" 
            });
        }

        // Validate coordinates
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude must be valid numbers"
            });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180"
            });
        }

        let imageURL = "";
        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "pawfect_reports"
            });
            imageURL = result.secure_url;
        }

        // GeoJSON format: [longitude, latitude] NOT [latitude, longitude]
        const report = await Report.create({
            animalType,
            address,
            description,
            contactNumber,
            image: imageURL,
            reportedBy: req.user._id,
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        });

        await report.populate("reportedBy", "name email");

        // Auto-suggest nearby volunteers
        const suggestedVolunteers = await VolunteerProfile.find({
            isApproved: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 10000 // 10 km
                }
            }
        })
        .populate("user", "name email")
        .limit(5);

        res.status(201).json({
            success: true,
            message: "Report created successfully",
            report,
            suggestedVolunteers: suggestedVolunteers.map(v => ({
                volunteerId: v._id,
                name: v.user.name,
                email: v.user.email,
                phone: v.phone,
                city: v.city,
                availability: v.availability
            }))
        });
    }
    catch(error){
        console.error("Create Report Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

exports.getReports = async (req, res)=>{
    try{
        const {status, animalType, location, page = 1, limit = 10} = req.query;
        const filter = {};

        //Filtering
        if(status){
            filter.status = status;
        }
        if(animalType){
            filter.animalType = animalType;
        }
        if(location){
            filter.location = {$regex: location, $options: "i"};
        }
        
        //Pagination
        const skip = (page - 1) * limit;
        const reports = await Report.find(filter)
            .populate("reportedBy", "name email")
            .populate({
                path: "assignedVolunteer",
                populate: {
                  path: "user",
                  select: "name email",
                },   
            })
            .sort({createdAt: -1})
            .skip(skip)
            .limit(Number(limit));
        const totalReports = await Report.countDocuments(filter);
        res.json({
            totalReports,
            currentPage : Number(page),
            totalPages : Math.ceil(totalReports/limit),
            reports
        });

    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
};

exports.getReportById = async (req, res) => {
    try{
        const report = await Report.findById(req.params.id)
            .populate("reportedBy", "name email");
        if(!report){
            return res.status(404).json({message: "Report not found"});
        }
        res.json(report);
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
};

exports.deleteReport = async (req, res) =>{
    try{
        const report = await Report.findById(req.params.id);
        if(!report){
            return res.status(404).json({message: "Report not found"});
        }
        if(
            report.reportedBy.toString() !== req.user._id.toString() && req.user.role !== "admin"
        ){
            return res.status(403).json({message: "Not authorized to delete this report"});
        }
        await report.deleteOne();
        res.json({message: "Report deleted successfully"});
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
};

exports.updateReport = async (req, res) => {
    try{
        const report = await Report.findById(req.params.id);
        if(!report){
            return res.status(404).json({message: "Report not found"});
        }
        //Only owner or admin can update
        if(
            report.reportedBy.toString() !== req.user._id.toString() && req.user.role !== "admin"
        ){
            return res.status(403).json({message: "Not authorized"});
        }
        const {animalType, location, description, contactNumber, status} = req.body;

        if(animalType) report.animalType = animalType;
        if(location) report.location = location;
        if(description) report.description = description;
        if(contactNumber) report.contactNumber = contactNumber;
        if(status) report.status = status;

        const updatedReport = await report.save();
        res.json(updatedReport);
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
};

exports.assignVolunteerToReport = async (req, res) => {
  try {
    const { reportId, volunteerId } = req.body;

    if (!reportId || !volunteerId) {
      return res.status(400).json({
        success: false,
        message: "reportId and volunteerId are required",
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status === "rescued") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign volunteer to a rescued report",
      });
    }

    const volunteer = await VolunteerProfile.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    if (!volunteer.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Volunteer is not approved yet",
      });
    }

    report.assignedVolunteer = volunteer._id;
    report.status = "assigned";

    await report.save();

    // Create rescue update record for audit trail
    const rescueUpdate = await RescueUpdate.create({
      report: report._id,
      volunteer: volunteer._id,
      status: "assigned",
      note: "Volunteer assigned to rescue mission",
    });

    const updatedReport = await Report.findById(report._id)
      .populate("reportedBy", "name email")
      .populate({
        path: "assignedVolunteer",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    // Emit real-time updates
    const io = require("express")().get("io");
    if (io) {
      emitRescueUpdate(io, report.reportedBy._id, report._id, {
        status: "assigned",
        volunteerName: updatedReport.assignedVolunteer.user.name,
        message: "Volunteer assigned to your rescue report",
      });

      emitToRescueRoom(io, report._id, "volunteer-assigned", {
        volunteer: updatedReport.assignedVolunteer,
        status: "assigned",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Volunteer assigned successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Assign Volunteer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while assigning volunteer",
      error: error.message,
    });
  }
};

// NEW: Update rescue status with real-time updates
exports.updateRescueStatus = async (req, res) => {
  try {
    const { status, note, location } = req.body;
    const reportId = req.params.id;

    const allowedStatuses = ["assigned", "en-route", "rescued", "shelter-reached", "closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const report = await Report.findById(reportId)
      .populate("reportedBy")
      .populate({
        path: "assignedVolunteer",
        populate: { path: "user" },
      });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Authorization: only assigned volunteer or admin can update
    const isAssignedVolunteer =
      report.assignedVolunteer &&
      report.assignedVolunteer.user._id.toString() === req.user._id.toString();

    if (!isAssignedVolunteer && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this rescue",
      });
    }

    // Validate status transitions
    const statusOrder = ["assigned", "en-route", "rescued", "shelter-reached", "closed"];
    const currentStatusIndex = statusOrder.indexOf(report.status);
    const newStatusIndex = statusOrder.indexOf(status);

    if (newStatusIndex < currentStatusIndex && status !== "closed") {
      return res.status(400).json({
        success: false,
        message: "Cannot downgrade rescue status",
      });
    }

    // Update report
    report.status = status;
    report.lastUpdateNote = note || "";

    await report.save();

    // Create audit trail entry
    const rescueUpdate = await RescueUpdate.create({
      report: reportId,
      volunteer: report.assignedVolunteer._id,
      status,
      note: note || "",
      location: location || "",
    });

    await rescueUpdate.populate("volunteer");

    const io = req.app.get("io");

    if (io) {
      // Send to report creator
      emitRescueUpdate(io, report.reportedBy._id, reportId, {
        status,
        note: note || "",
        volunteerName: report.assignedVolunteer.user.name,
        message: `Rescue status updated to: ${status}`,
        rescueUpdate,
      });

      // Broadcast to all tracking this rescue
      emitToRescueRoom(io, reportId, "rescue-status-update", {
        status,
        note: note || "",
        location: location || "",
        volunteerId: report.assignedVolunteer.user._id,
        volunteerName: report.assignedVolunteer.user.name,
        rescueUpdate,
      });

      // Special events for milestones
      if (status === "rescued") {
        io.to(`user:${report.reportedBy._id}`).emit("animal-rescued", {
          reportId,
          animalType: report.animalType,
          message: "Animal has been rescued!",
        });
      } else if (status === "shelter-reached") {
        io.to(`user:${report.reportedBy._id}`).emit("animal-shelter-reached", {
          reportId,
          animalType: report.animalType,
          message: "Animal has reached the shelter",
        });
      }
    }

    const finalReport = await Report.findById(reportId)
      .populate("reportedBy", "name email")
      .populate({
        path: "assignedVolunteer",
        populate: { path: "user", select: "name email" },
      });

    return res.status(200).json({
      success: true,
      message: `Rescue status updated to ${status}`,
      report: finalReport,
      rescueUpdate,
    });
  } catch (error) {
    console.error("Update Rescue Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating rescue status",
      error: error.message,
    });
  }
};

// Get rescue timeline
exports.getRescueTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const updates = await RescueUpdate.find({ report: id })
      .populate("volunteer", "user")
      .sort({ createdAt: 1 });

    if (!updates) {
      return res.status(404).json({
        success: false,
        message: "No rescue updates found",
      });
    }

    res.status(200).json({
      success: true,
      count: updates.length,
      timeline: updates,
    });
  } catch (error) {
    console.error("Get Rescue Timeline Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "in-progress", "rescued"];

    // Check valid status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Find report
    const report = await Report.findById(req.params.id)
      .populate("assignedVolunteer");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Prevent editing rescued reports
    if (report.status === "rescued") {
      return res.status(400).json({
        success: false,
        message: "Report already marked as rescued",
      });
    }

    // Check if user is admin
    const isAdmin = req.user.role === "admin";

    // Check if assigned volunteer
    const isAssignedVolunteer =
      report.assignedVolunteer &&
      report.assignedVolunteer.user.toString() === req.user._id.toString();

    // Authorization check
    if (!isAdmin && !isAssignedVolunteer) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this report",
      });
    }

    // Update status
    report.status = status;

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate("reportedBy", "name email")
      .populate({
        path: "assignedVolunteer",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report: updatedReport,
    });

  } catch (error) {
    console.error("Update Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating status",
      error: error.message,
    });
  }
};

// Geospatial: Find nearby reports
exports.getNearbyReports = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide latitude and longitude"
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates"
      });
    }

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .populate("reportedBy", "name email")
    .populate({
      path: "assignedVolunteer",
      populate: { path: "user", select: "name email" }
    });

    res.status(200).json({
      success: true,
      count: reports.length,
      searchCenter: {
        type: "Point",
        coordinates: [lng, lat]
      },
      maxDistanceMeters: maxDistance,
      reports
    });

  } catch (error) {
    console.error("Get Nearby Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching nearby reports",
      error: error.message
    });
  }
};

// Geospatial: Get nearby shelters for a report location
exports.getNearbyShelters = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxDistance = 10000 } = req.query;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    const Shelter = require("../models/Shelter");

    const shelters = await Shelter.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: report.location.coordinates
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.status(200).json({
      success: true,
      count: shelters.length,
      reportLocation: report.location,
      maxDistanceMeters: maxDistance,
      shelters
    });

  } catch (error) {
    console.error("Get Nearby Shelters Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching nearby shelters",
      error: error.message
    });
  }
};