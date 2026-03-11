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
    reportedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt : {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Report", reportSchema);