const express = require("express");
const router = express.Router();
const {
    rescueGuide,
    analyzeSeverityController
} = require("../controllers/aiController");

router.post(
    "/rescue-guide",
    rescueGuide
);

router.post(
    "/analyze-severity",
    analyzeSeverityController
);

module.exports = router;