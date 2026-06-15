const mongoose = require("mongoose");

const shelterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    capacity: {
        type: Number,
        default: 0,
    },
    currentAnimals: {
        type: Number,
        default: 0,
    },
    availableSpace: {
        type: Number,
        default: 0,
    },
    specializations: [{
        type: String,
        enum: ["Dogs", "Cats", "Birds", "Small Animals", "Large Animals", "Mixed"]
    }],
    website: {
        type: String,
    },
    operatingHours: {
        type: String,
        default: "9:00 AM - 5:00 PM",
    },
    description: {
        type: String,
    },
}, { timestamps: true });

// Geospatial index for nearby shelter searches
shelterSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Shelter", shelterSchema);
