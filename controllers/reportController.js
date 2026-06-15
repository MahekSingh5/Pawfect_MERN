const Report = require("../models/Report");
const cloudinary = require("../config/cloudinary");
const VolunteerProfile = require("../models/VolunteerProfile");

exports.createReport = async (req , res) => {
    try{
        
        const { animalType, location, description, contactNumber} = req.body;
        if (!animalType || !location || !description || !contactNumber) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }
        let imageURL = "";
        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "pawfect_reports"
            });
            imageURL = result.secure_url;
        }
        const report = await Report.create({
            animalType,
            location,
            description,
            contactNumber,
            image: imageURL,
            reportedBy: req.user._id
        });
        res.status(201).json(report);
    }
    catch(error){
        res.status(500).json({message: error.message || "Server Error"});
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
    report.status = "in-progress";

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