const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res)=>{
    try {
        const {name, email, password} = req.body;
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword,
            role: "user"
        });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            message: "User registered successfully",
        });
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
};

exports.loginUser = async (req, res)=>{
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        //check if email exits
        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        //check if password is correct
        if(!isMatch){
            return res.status(400).json({message: "Invalid email or password"});
        }
        //Generate JWT
        const token = jwt.sign(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn : "7d"}
        );
        //send response
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });


    }catch(error){
        res.status(500).json({message: "Server error"});
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user._id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if new email is already taken (if email is being changed)
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // Update allowed fields
        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
            return res.status(400).json({ message: "Password must contain letters and numbers" });
        }

        // Get user with password field
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

exports.deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required to delete account" });
        }

        // Get user with password field
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        // Delete user and associated volunteer profile if exists
        const VolunteerProfile = require("../models/VolunteerProfile");
        await VolunteerProfile.deleteOne({ user: userId });
        await User.findByIdAndDelete(userId);

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};