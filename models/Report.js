const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    animalType : {
        type: String,
        required: true
    },
    address : {
        type: String,
        required: true
    },
    location : {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        }
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
        enum: ["pending", "assigned", "en-route", "rescued", "shelter-reached", "closed"],
        default: "pending"
    },
    lastUpdateNote: {
        type: String,
        default: ""
    }
}, {timestamps: true});

// Geospatial index for nearby searches
reportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Report", reportSchema);