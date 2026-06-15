const express = require('express');
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const { createReport, getReports, getReportById, deleteReport, updateReport, updateReportStatus, assignVolunteerToReport, updateRescueStatus, getRescueTimeline, getNearbyReports, getNearbyShelters } = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, (req, res, next)=> {
    upload.single("image")(req, res, function(err){
        if(err){
            if(err.code == "LIMIT_FILE_SIZE"){
                return res.status(400).json({message: "Image size should be less than 5 MB"});
            }
            return res.status(400).json({message: err.message});
        }
        next();
    });
}, createReport);
router.get("/", getReports);
router.put("/assign-volunteer", protect, adminOnly, assignVolunteerToReport);

// Geospatial endpoints
router.get("/nearby", getNearbyReports);
router.get("/:id/nearby-shelters", getNearbyShelters);

// Real-time rescue tracking endpoints
router.put("/:id/rescue-status", protect, updateRescueStatus);
router.get("/:id/timeline", getRescueTimeline);

router.put("/:id/status", protect, updateReportStatus);
router.get("/:id", getReportById);
router.delete("/:id", protect, deleteReport);
router.put("/:id", protect, updateReport);

module.exports = router;