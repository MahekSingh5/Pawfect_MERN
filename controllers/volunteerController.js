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
    try{
        const {id} = req. params;
        const volunteer = await VolunteerProfile.findById(id);
        if(!volunteer){
            return res.status(404).json({
                success: false,
                message: "Volunteer request not found",
            });
        }
        volunteer.isApproved = true;
        await volunteer.save();
        const updatedVolunteer = await VolunteerProfile.findById(id).populate(
            "user",
            "name email"
        );
        return res.status(200).json({
            success: true,
            message : "Volunteer approved successfully",
            volunteer: updatedVolunteer,
        });
    }catch(error){
        console.error("Approved Volunteer Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while approving volunteer",
            error: error.message,
        });
    }
};

exports.rejectVolunteer = async (req, res) => {
    try {
        const { id } = req.params;
        const volunteer = await VolunteerProfile.findById(id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer request not found",
            });
        }

        // Delete volunteer profile
        await VolunteerProfile.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Volunteer application rejected and deleted",
        });
    } catch (error) {
        console.error("Reject Volunteer Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while rejecting volunteer",
            error: error.message,
        });
    }
};

exports.deApproveVolunteer = async (req, res) => {
    try {
        const { id } = req.params;
        const volunteer = await VolunteerProfile.findById(id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer profile not found",
            });
        }

        if (!volunteer.isApproved) {
            return res.status(400).json({
                success: false,
                message: "Volunteer is not approved yet",
            });
        }

        volunteer.isApproved = false;
        await volunteer.save();

        const updatedVolunteer = await VolunteerProfile.findById(id).populate(
            "user",
            "name email"
        );

        return res.status(200).json({
            success: true,
            message: "Volunteer de-approved successfully",
            volunteer: updatedVolunteer,
        });
    } catch (error) {
        console.error("De-approve Volunteer Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while de-approving volunteer",
            error: error.message,
        });
    }
};

exports.updateVolunteerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { phone, city, availability, preferredAnimals, experience } = req.body;

        const volunteer = await VolunteerProfile.findById(id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer profile not found",
            });
        }

        // Check authorization - only admin or the volunteer owner can update
        if (
            volunteer.user.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this profile",
            });
        }

        // Update fields if provided
        if (phone) volunteer.phone = phone;
        if (city) volunteer.city = city;
        if (availability) {
            const validAvailability = ["full-time", "part-time", "weekends", "on-call"];
            if (!validAvailability.includes(availability)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid availability value",
                });
            }
            volunteer.availability = availability;
        }
        if (preferredAnimals) volunteer.preferredAnimals = preferredAnimals;
        if (experience) volunteer.experience = experience;

        await volunteer.save();

        const updatedVolunteer = await VolunteerProfile.findById(id).populate(
            "user",
            "name email"
        );

        return res.status(200).json({
            success: true,
            message: "Volunteer profile updated successfully",
            volunteer: updatedVolunteer,
        });
    } catch (error) {
        console.error("Update Volunteer Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating profile",
            error: error.message,
        });
    }
};