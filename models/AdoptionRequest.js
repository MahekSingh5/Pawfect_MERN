const mongoose = require("mongoose");

const adoptionRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
        required: true
    },
    message:{
        type: String,
        default: ""
    },
    contactNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, {timestamps: true});

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);