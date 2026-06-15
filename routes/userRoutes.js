const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateUserProfile, changePassword, deleteUserAccount } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { validateRegistration, validateEmail, validatePassword } = require("../middleware/validationMiddleware");

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateEmail, loginUser);
router.get("/profile", protect, (req, res)=>{
    res.json(req.user);
});
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteUserAccount);

module.exports = router;