const mongoose = require("mongoose");

const rescueUpdateSchema = new mongoose.Schema({
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
        required: true,
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VolunteerProfile",
    },
    status: {
        type: String,
        enum: ["pending", "assigned", "en-route", "rescued", "shelter-reached", "closed"],
        required: true,
    },
    note: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
}, { timestamps: true });

// Create index for faster queries by report and date
rescueUpdateSchema.index({ report: 1, createdAt: -1 });

module.exports = mongoose.model("RescueUpdate", rescueUpdateSchema);
