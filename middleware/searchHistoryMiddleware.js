const SearchHistory = require("../models/SearchHistory");

exports.trackSearch = async (req, res, next) => {
  try {
    if (req.user) {
      const { status, animalType, location, page, limit } = req.query;
      
      await SearchHistory.create({
        user: req.user._id,
        query: req.originalUrl,
        filters: { status, animalType, location },
        resultsCount: req.body?.resultsCount || 0,
      });
    }
    next();
  } catch (error) {
    console.error("Search history tracking error:", error);
    next(); // Continue even if tracking fails
  }
};
