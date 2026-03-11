const Report = require("../models/Report");
exports.createReport = async (req , res) => {
    try{
        const { animalType, location, description, contactNumber} = req.body;
        const report = await Report.create({
            animalType,
            location,
            description,
            contactNumber,
            reportedBy: req.user_id
        });
        res.status(201).json(report);
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
};