const { current } = require("@reduxjs/toolkit");
const Report = require("../models/Report");
const cloudinary = require("../config/cloudinary");

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
            report.reportedBy.toString() != req.user._id.toString() && !req.user.role !== "admin"
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
            report.reportedBy.toString() !== req.user._id.toString() && !req.user.role !== "admin"
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