const express = require('express');
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const { createReport, getReports, getReportById, deleteReport, updateReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

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
router.get("/:id", getReportById);
router.delete("/:id", protect, deleteReport);
router.put("/:id", protect, updateReport);


module.exports = router;