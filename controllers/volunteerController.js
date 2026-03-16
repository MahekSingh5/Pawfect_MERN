const mongoose = require("mongoose");
const VolunteerProfile = require("../models/VolunteerProfile");

exports.applyVolunteer = async (req , res) => {
    try{
        const {phone, city, availability, preferredAnimals, experience } = req.body;
        if(!phone || !city || !availability){
            return res.status(400).json({message: "Phone, city and availability are required"});
        }
        const existingProfile = await VolunteerProfile.findOne({user: req.user._id});
        if(existingProfile){
            return res.status(400).json({message: "Volunteer profile already exists for this user"});
        }
        const volunteerProfile = await VolunteerProfile.create({
            user: req.user._id,
            phone,
            city,
            availability,
            preferredAnimals,
            experience
        });
        res.status(201).json({
            message: "Volunteer application submitted successfully",
            volunteerProfile
        });
    }
    catch(error){
        res.status(500).json({message: error.message || "Server Error"})
    }
};

exports.getMyVolunteerProfile = async (req, res) => {
    try{
        const volunteerProfile = await VolunteerProfile.findOne({user: req.user._id})
            .populate("user", "name email role");
            if(!volunteerProfile){
                return res.status(404).json({message: "Volunteer profile not found"});
            }
            res.json(volunteerProfile);
    }catch(error){
        res.status(500).json({message: error.message || "Server Error"});
    }
};

exports.getAllVolunteerProfiles = async (req, res) => {
    try{
        const profiles = await VolunteerProfile.find()
            .populate("user", "name email role")
            .sort({createdAt: -1});
        res.json(profiles);
    }catch(error){
        res.status(500).json({message: error.message || "Server Error"});
    }
};

exports.approveVolunteer = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid volunteer ID" });
        }
        const volunteerProfile = await VolunteerProfile.findById(id);
        if (!volunteerProfile) {
            return res.status(404).json({ message: "Volunteer profile not found" });
        }
        volunteerProfile.isApproved = true;
        const updatedProfile = await volunteerProfile.save();
        res.json({
            message: "Volunteer approved successfully",
            volunteerProfile: updatedProfile
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};