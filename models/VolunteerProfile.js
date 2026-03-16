const mongoose = require("mongoose");

const volunteerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    availability: {
        type: String,
        enum: ["full-time", "part-time", "weekends", "on-call"],
        required: true
    },
    preferredAnimals: [{
        type: String
    }],
    experience: {
        type: String,
        default: ""
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, {timestamps : true});

module.exports = mongoose.model("VolunteerProfile", volunteerProfileSchema);