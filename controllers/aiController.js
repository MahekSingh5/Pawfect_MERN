const aiService = require("../services/aiService");
const rescueGuide = async (req,res) => {
    try{
        const { question } = req.body;
        const response =
            await aiService.generateRescueGuidance(
                question
            );
        return res.status(200).json({
            success:true,
            response
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const analyzeSeverityController = async (req, res) => {
    try {
        const { description } = req.body;
        const analysis =
            await aiService.analyzeSeverity(description);
        return res.status(200).json({
            success: true,
            analysis
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    rescueGuide,
    analyzeSeverityController
};