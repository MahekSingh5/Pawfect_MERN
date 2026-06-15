const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  filters: {
    status: String,
    animalType: String,
    location: String,
  },
  resultsCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
