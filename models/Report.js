const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    animalType : {
        type: String,
        required: true
    },
    location : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    contactNumber : {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    reportedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    assignedVolunteer : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "VolunteerProfile",
        default : null,
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "rescued"],
        default: "pending"
    }
}, {timestamps: true});

module.exports = mongoose.model("Report", reportSchema);