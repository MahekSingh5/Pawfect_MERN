const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VolunteerProfile",
  },
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report",
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ["volunteer", "adoption", "rescue"],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
